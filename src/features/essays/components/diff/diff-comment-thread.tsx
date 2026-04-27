import type { InstaQLEntity } from "@instantdb/react";
import {
  ActionIcon,
  Avatar,
  Group,
  Paper,
  Stack,
  Text,
  useComputedColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconRobot, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { getUserDisplayName, getUserInitials } from "~/features/auth/utils/user-display-name";
import { DiffCommentThreadEditForm } from "~/features/essays/components/diff/diff-thread-edit-form";
import type { useDiffComments } from "~/features/essays/hooks/diff/use-diff-comments";
import type { DiffComment } from "~/features/essays/schemas/essay-schema";
import { formatCommentTimestamp } from "~/utils/format-comment-timestamp";

type DiffCommentThreadProps = {
  comments: DiffComment[];
  onDeleteUserComment?: ReturnType<typeof useDiffComments>["removeUserComment"];
  onUpdateUserComment?: ReturnType<typeof useDiffComments>["updateUserComment"];
  isPending?: ReturnType<typeof useDiffComments>["isPending"];
};

export function DiffCommentThread({
  comments,
  onDeleteUserComment,
  onUpdateUserComment,
  isPending = false,
}: DiffCommentThreadProps) {
  const colorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const suggestionColor = colorScheme === "dark" ? "blue.2" : "blue.7";

  const [editingId, setEditingId] = useState<null | InstaQLEntity<AppSchema, "diffComments">["id"]>(
    null,
  );
  const [busyId, setBusyId] = useState<null | InstaQLEntity<AppSchema, "diffComments">["id"]>(null);

  const { user } = db.useAuth();
  const { data: usersData } = db.useQuery({
    $users: { $: { where: { email: user?.email ?? "" } } },
  });
  const meProfile = usersData?.$users?.[0];
  const meDisplayName = getUserDisplayName(meProfile?.username, meProfile?.email ?? user?.email);

  if (comments.length === 0) {
    return null;
  }

  const startEdit = (comment: DiffComment) => {
    if (!onUpdateUserComment) {
      return;
    }

    setEditingId(comment.id);
  };

  const saveEdit = (id: InstaQLEntity<AppSchema, "diffComments">["id"], nextBody: string) => {
    if (!onUpdateUserComment) {
      return;
    }

    onUpdateUserComment(id, nextBody);
    setEditingId(null);
  };

  const requestDelete = (id: InstaQLEntity<AppSchema, "diffComments">["id"]) => {
    if (!onDeleteUserComment) {
      return;
    }

    modals.openConfirmModal({
      children: <Text size="sm">このコメントを削除しますか？</Text>,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: () => {
        setBusyId(id);

        try {
          onDeleteUserComment(id);
        } finally {
          setBusyId(null);
        }
      },
      title: "コメントを削除",
    });
  };

  return (
    <Stack gap="xs" p="xs">
      {comments.map((comment) => {
        const isUser = comment.kind === "user";
        const isEditing = editingId === comment.id;
        const timeLabel = formatCommentTimestamp(comment.createdAt);
        const showMutate = isUser && (onUpdateUserComment != null || onDeleteUserComment != null);

        return (
          <Paper key={comment.id} p="xs" radius="sm" shadow="xs" withBorder>
            <Group align="flex-start" gap="xs" wrap="nowrap">
              {isUser ? (
                <Avatar
                  className="shrink-0 rounded-full"
                  color="indigo"
                  size="sm"
                  variant="gradient"
                >
                  {getUserInitials(meDisplayName)}
                </Avatar>
              ) : (
                <Avatar color="blue" size="xs">
                  <IconRobot size={12} />
                </Avatar>
              )}
              <Stack gap="xs" className="min-w-0 flex-1">
                <Group gap="xs" justify="space-between" wrap="nowrap">
                  <Text
                    c="dimmed"
                    size="xs"
                    className="min-w-0 flex-1"
                    lineClamp={1}
                    title={isUser ? meDisplayName : "AI"}
                  >
                    {isUser ? meDisplayName : "AI"} · {timeLabel}
                    {comment.updatedAt && isUser ? "（編集あり）" : null}{" "}
                  </Text>
                  {showMutate && !isEditing && (
                    <Group gap={4} wrap="nowrap">
                      {onUpdateUserComment != null && (
                        <ActionIcon
                          aria-label="コメントを編集"
                          color="blue"
                          disabled={busyId != null || isPending}
                          onClick={() => {
                            startEdit(comment);
                          }}
                          size="sm"
                          variant="subtle"
                        >
                          <IconPencil size={14} />
                        </ActionIcon>
                      )}
                      {onDeleteUserComment && (
                        <ActionIcon
                          aria-label="コメントを削除"
                          color="red"
                          disabled={Boolean(busyId) || isPending}
                          onClick={() => {
                            requestDelete(comment.id);
                          }}
                          size="sm"
                          title="コメントを削除"
                          variant="light"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  )}
                </Group>
                {isEditing && isUser && onUpdateUserComment != null ? (
                  <DiffCommentThreadEditForm
                    key={comment.id}
                    initialBody={comment.body}
                    isPending={isPending}
                    onCancel={() => {
                      setEditingId(null);
                    }}
                    onSave={(nextBody) => {
                      return saveEdit(comment.id, nextBody);
                    }}
                  />
                ) : (
                  <>
                    <Text size="xs">{comment.body}</Text>
                    {comment.suggestion != null && (
                      <Text c={suggestionColor} size="xs">
                        💡 {comment.suggestion}
                      </Text>
                    )}
                  </>
                )}
              </Stack>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}

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
import { IconPencil, IconRobot, IconTrash, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";

import { DiffCommentThreadEditForm } from "~/features/essay-feedback/components/diff-thread-edit-form";
import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";
import type { AppSchema } from "~/lib/instant-schema";

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
        const timeLabel = dayjs(comment.createdAt).format("HH:mm");
        const showMutate = isUser && (onUpdateUserComment != null || onDeleteUserComment != null);

        return (
          <Paper key={comment.id} p="xs" radius="sm" shadow="xs" withBorder>
            <Group align="flex-start" gap="xs" wrap="nowrap">
              <Avatar color={isUser ? "gray" : "blue"} size="xs">
                {isUser ? <IconUser size={12} /> : <IconRobot size={12} />}
              </Avatar>
              <Stack gap="xs" className="min-w-0 flex-1">
                <Group gap="xs" justify="space-between" wrap="nowrap">
                  <Text c="dimmed" size="xs" className="flex-1">
                    {isUser ? "あなた" : "AI"} · {timeLabel}
                    {comment.updatedAt != null && isUser ? "（編集あり）" : null}
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

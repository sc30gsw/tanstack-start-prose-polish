import type { InstaQLEntity } from "@instantdb/react";
import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  useComputedColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconRobot, IconTrash, IconUser } from "@tabler/icons-react";
import { useState } from "react";

import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";
import type { AppSchema } from "~/lib/instant-schema";

type DiffCommentThreadProps = {
  comments: ReturnType<typeof useDiffComments>["comments"];
  onDeleteUserComment?: ReturnType<typeof useDiffComments>["removeUserComment"];
  onUpdateUserComment?: ReturnType<typeof useDiffComments>["updateUserComment"];
  isPending: ReturnType<typeof useDiffComments>["isPending"];
};

export function DiffCommentThread({
  comments,
  onDeleteUserComment,
  onUpdateUserComment,
  isPending,
}: DiffCommentThreadProps) {
  const colorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const suggestionColor = colorScheme === "dark" ? "blue.2" : "blue.7";

  const [editingId, setEditingId] = useState<null | string>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<null | string>(null);

  if (comments.length === 0) {
    return null;
  }

  const startEdit = (comment: DiffComment) => {
    if (!onUpdateUserComment) {
      return;
    }

    setEditingId(comment.id);
    setDraft(comment.body);
  };

  const saveEdit = (id: InstaQLEntity<AppSchema, "diffComments">["id"]) => {
    if (!onUpdateUserComment) {
      return;
    }

    setBusyId(id);

    try {
      onUpdateUserComment(id, draft);
      setEditingId(null);
    } finally {
      setBusyId(null);
    }
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
        const isUser = comment.author === "user";
        const isEditing = editingId === comment.id;
        const timeLabel = new Date(comment.createdAt).toLocaleString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const showMutate = isUser && (onUpdateUserComment != null || onDeleteUserComment != null);

        return (
          <Paper key={comment.id} p="xs" radius="sm" shadow="xs" withBorder>
            <Group align="flex-start" gap="xs" wrap="nowrap">
              <Avatar color={isUser ? "gray" : "blue"} size="xs">
                {isUser ? <IconUser size={12} /> : <IconRobot size={12} />}
              </Avatar>
              <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" justify="space-between" wrap="nowrap">
                  <Text c="dimmed" size="xs" style={{ flex: 1 }}>
                    {isUser ? "あなた" : "AI"} · {timeLabel}
                    {comment.updatedAt != null && isUser ? "（編集あり）" : null}
                  </Text>
                  {showMutate && !isEditing && (
                    <Group gap={4} wrap="nowrap">
                      {onUpdateUserComment != null && (
                        <ActionIcon
                          aria-label="コメントを編集"
                          color="blue"
                          disabled={busyId != null}
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
                  <Stack gap="xs">
                    <Textarea
                      aria-label="コメントを編集"
                      autosize
                      minRows={2}
                      onChange={(e) => {
                        setDraft(e.currentTarget.value);
                      }}
                      value={draft}
                      disabled={isPending}
                    />
                    <Group gap="xs" justify="flex-end">
                      <Button
                        disabled={busyId === comment.id || isPending}
                        onClick={() => {
                          setEditingId(null);
                        }}
                        size="xs"
                        variant="default"
                      >
                        キャンセル
                      </Button>
                      <Button
                        disabled={draft.trim() === "" || busyId === comment.id || isPending}
                        loading={busyId === comment.id}
                        onClick={() => {
                          saveEdit(comment.id);
                        }}
                        size="xs"
                      >
                        保存
                      </Button>
                    </Group>
                  </Stack>
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

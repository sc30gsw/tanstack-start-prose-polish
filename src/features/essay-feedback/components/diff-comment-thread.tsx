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

import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";

type DiffCommentThreadProps = {
  comments: DiffComment[];
  onDeleteUserComment?: (commentId: string) => Promise<void>;
  onUpdateUserComment?: (commentId: string, body: string) => Promise<void>;
};

export function DiffCommentThread({
  comments,
  onDeleteUserComment,
  onUpdateUserComment,
}: DiffCommentThreadProps) {
  const colorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const suggestionColor = colorScheme === "dark" ? "blue.2" : "blue.7";

  const [editingId, setEditingId] = useState<null | string>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<null | string>(null);

  if (comments.length === 0) return null;

  function startEdit(comment: DiffComment) {
    if (onUpdateUserComment == null) return;
    setEditingId(comment.id);
    setDraft(comment.body);
  }

  async function saveEdit(id: string) {
    if (onUpdateUserComment == null) return;
    setBusyId(id);
    try {
      await onUpdateUserComment(id, draft);
      setEditingId(null);
    } finally {
      setBusyId(null);
    }
  }

  function requestDelete(id: string) {
    if (onDeleteUserComment == null) return;
    modals.openConfirmModal({
      children: <Text size="sm">このコメントを削除しますか？</Text>,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: async () => {
        setBusyId(id);
        try {
          await onDeleteUserComment(id);
        } finally {
          setBusyId(null);
        }
      },
      title: "コメントを削除",
    });
  }

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
                    <Group gap={6} wrap="nowrap">
                      {onUpdateUserComment != null && (
                        <ActionIcon
                          aria-label="コメントを編集"
                          color="blue"
                          disabled={busyId != null}
                          onClick={() => {
                            startEdit(comment);
                          }}
                          size="md"
                          variant="light"
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                      )}
                      {onDeleteUserComment != null && (
                        <ActionIcon
                          aria-label="コメントを削除"
                          color="red"
                          disabled={busyId != null}
                          onClick={() => {
                            requestDelete(comment.id);
                          }}
                          size="md"
                          variant="light"
                        >
                          <IconTrash size={18} />
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
                    />
                    <Group gap="xs" justify="flex-end">
                      <Button
                        disabled={busyId === comment.id}
                        onClick={() => {
                          setEditingId(null);
                        }}
                        size="xs"
                        variant="default"
                      >
                        キャンセル
                      </Button>
                      <Button
                        disabled={draft.trim() === "" || busyId === comment.id}
                        loading={busyId === comment.id}
                        onClick={() => {
                          void saveEdit(comment.id);
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

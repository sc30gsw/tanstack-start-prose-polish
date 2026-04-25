import { Avatar, Group, Paper, Stack, Text } from "@mantine/core";
import { IconRobot, IconUser } from "@tabler/icons-react";

import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";

type DiffCommentThreadProps = {
  comments: DiffComment[];
};

export function DiffCommentThread({ comments }: DiffCommentThreadProps) {
  if (comments.length === 0) return null;

  return (
    <Stack gap="xs" p="xs">
      {comments.map((comment) => (
        <Paper key={comment.id} p="xs" radius="sm" shadow="xs" withBorder>
          <Group align="flex-start" gap="xs">
            <Avatar color={comment.author === "ai" ? "blue" : "gray"} size="xs">
              {comment.author === "ai" ? <IconRobot size={12} /> : <IconUser size={12} />}
            </Avatar>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text c="dimmed" size="xs">
                {comment.author === "ai" ? "AI" : "あなた"} ·{" "}
                {new Date(comment.createdAt).toLocaleString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text size="xs">{comment.body}</Text>
              {comment.suggestion != null && (
                <Text c="blue.7" size="xs">
                  💡 {comment.suggestion}
                </Text>
              )}
            </Stack>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

import { Alert, Stack, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

type AiCommentBadgeProps = {
  body: string;
  suggestion?: string;
};

export function AiCommentBadge({ body, suggestion }: AiCommentBadgeProps) {
  return (
    <Alert color="blue" icon={<IconSparkles size={14} />} p="xs" title="AI 指摘" variant="light">
      <Stack gap={4}>
        <Text size="xs">{body}</Text>
        {suggestion != null && (
          <Text c="blue.7" size="xs">
            💡 {suggestion}
          </Text>
        )}
      </Stack>
    </Alert>
  );
}

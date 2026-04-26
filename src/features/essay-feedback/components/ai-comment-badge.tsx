import { Alert, Stack, Text, UnstyledButton, useComputedColorScheme } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";

type AiCommentBadgeProps = {
  body: ReturnType<typeof useDiffComments>["comments"][number]["body"];
  onOpenDetail?: () => void;
  suggestion?: ReturnType<typeof useDiffComments>["comments"][number]["suggestion"];
};

export function AiCommentBadge({ body, onOpenDetail, suggestion }: AiCommentBadgeProps) {
  const colorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const suggestionColor = colorScheme === "dark" ? "blue.2" : "blue.7";

  const inner = (
    <Alert color="blue" icon={<IconSparkles size={14} />} p="xs" title="AI 指摘" variant="light">
      <Stack gap={4}>
        <Text size="xs">{body}</Text>
        {suggestion != null && (
          <Text c={suggestionColor} size="xs">
            💡 {suggestion}
          </Text>
        )}
      </Stack>
    </Alert>
  );

  if (!onOpenDetail) {
    return inner;
  }

  return (
    <UnstyledButton
      aria-label="AI 指摘の詳細を開く"
      display="block"
      onClick={onOpenDetail}
      p={0}
      w="100%"
    >
      {inner}
    </UnstyledButton>
  );
}

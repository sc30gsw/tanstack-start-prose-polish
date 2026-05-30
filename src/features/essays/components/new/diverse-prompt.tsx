import { Alert, Button, Loader, Stack, Text } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

import { useDailyPrompt } from "~/features/essays/hooks/use-daily-prompt";

type DiverseModePromptProps = {
  onQuestionLoaded: (question: string) => void;
};

export function DiverseModePrompt({ onQuestionLoaded }: DiverseModePromptProps) {
  const { error, isLoading, payload, retry } = useDailyPrompt("diverse");
  const question = typeof payload === "string" ? payload : null;

  /**
   * 親の `form.Field` から毎レンダー新しい関数が渡るため、依存に入れず ref 経由で最新を呼ぶ。
   * 質問が確定したら 1 度だけフォームに反映する。
   */
  const onQuestionLoadedRef = useRef(onQuestionLoaded);
  onQuestionLoadedRef.current = onQuestionLoaded;

  useEffect(() => {
    if (question) {
      onQuestionLoadedRef.current(question);
    }
  }, [question]);

  if (error) {
    return (
      <Alert color="red" title="お題の生成に失敗しました" variant="light">
        <Stack align="flex-start" gap="sm">
          <Text size="md">{error}</Text>
          <Button onClick={() => void retry()} size="sm" variant="light">
            再生成する
          </Button>
        </Stack>
      </Alert>
    );
  }

  if (isLoading || question == null) {
    return (
      <Stack align="center" gap="md" py="lg">
        <Loader aria-label="質問を生成中" size="md" />
        <Text c="dimmed" lh={1.65} size="md">
          AI が質問を生成中...
        </Text>
      </Stack>
    );
  }

  return (
    <Alert icon={<IconBulb />} p="md" title="今日の問い" variant="light">
      <Text lh={1.7} size="md">
        {question}
      </Text>
    </Alert>
  );
}

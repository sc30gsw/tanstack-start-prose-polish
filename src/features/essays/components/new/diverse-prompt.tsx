import { Alert, Loader, Stack, Text } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

import { ErrorRetryAlert } from "~/components/error-retry-alert";
import { useDailyPrompt } from "~/features/essays/hooks/use-daily-prompt";

type DiverseModePromptProps = {
  onQuestionLoaded: (question: string) => void;
};

export function DiverseModePrompt({ onQuestionLoaded }: DiverseModePromptProps) {
  const { error, isLoading, payload, retry } = useDailyPrompt("diverse");
  const question = typeof payload === "string" && payload.length > 0 ? payload : null;

  /*
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
      <ErrorRetryAlert
        message={error}
        onRetry={() => void retry()}
        retryLabel="再生成する"
        title="お題の生成に失敗しました"
      />
    );
  }

  if (isLoading) {
    return (
      <Stack align="center" gap="md" py="lg">
        <Loader aria-label="質問を生成中" size="md" />
        <Text c="dimmed" lh={1.65} size="md">
          AI が質問を生成中...
        </Text>
      </Stack>
    );
  }

  if (!question) {
    return (
      <ErrorRetryAlert
        color="gray"
        message="お題を生成できませんでした。もう一度お試しください。"
        onRetry={() => void retry()}
        retryLabel="再生成する"
        title="お題がありません"
      />
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

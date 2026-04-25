import { Alert, Loader, Stack, Text } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { askDiverseMode } from "~/features/essay-feedback/api/mock-ai";

type DiverseModePromptProps = {
  onQuestionLoaded: (question: string) => void;
};

export function DiverseModePrompt({ onQuestionLoaded }: DiverseModePromptProps) {
  const [question, setQuestion] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);
  /**
   * 親の `form.Field` から毎レンダー新しい関数が渡る。依存にすると完了のたびに
   * effect が再実行され、永遠にローディングに戻る。TopicPicker 同様マウント時1回だけ取得し、
   * 最新コールバックは ref 経由で呼ぶ。
   */
  const onQuestionLoadedRef = useRef(onQuestionLoaded);
  onQuestionLoadedRef.current = onQuestionLoaded;

  useEffect(() => {
    setIsLoading(true);
    void askDiverseMode().then((result) =>
      result.match({
        err: () => setIsLoading(false),
        ok: (q) => {
          setQuestion(q);
          onQuestionLoadedRef.current(q);
          setIsLoading(false);
        },
      }),
    );
  }, []);

  if (isLoading) {
    return (
      <Stack align="center" py="md">
        <Loader aria-label="質問を生成中" size="sm" />
        <Text c="dimmed" size="sm">
          AI が質問を生成中...
        </Text>
      </Stack>
    );
  }

  if (question == null) return null;

  return (
    <Alert icon={<IconBulb />} title="今日の問い" variant="light">
      <Text size="sm">{question}</Text>
    </Alert>
  );
}

import { Loader, Radio, Stack, Text } from "@mantine/core";

import { ErrorRetryAlert } from "~/components/error-retry-alert";
import { useDailyPrompt } from "~/features/essays/hooks/use-daily-prompt";

type TopicPickerProps = {
  field: {
    handleChange: (value: string | undefined) => void;
    state: { value: string | undefined };
  };
};

export function TopicPicker({ field }: TopicPickerProps) {
  const { error, isLoading, payload, retry } = useDailyPrompt("topic");
  const topics = Array.isArray(payload)
    ? payload.filter((t): t is string => typeof t === "string")
    : [];

  if (error) {
    return (
      <ErrorRetryAlert
        message={error}
        onRetry={() => void retry()}
        retryLabel="再生成する"
        title="トピックの生成に失敗しました"
      />
    );
  }

  if (isLoading) {
    return (
      <Stack align="center" gap="md" py="lg">
        <Loader aria-label="トピックを生成中" size="md" />
        <Text c="dimmed" lh={1.65} size="md">
          AI がトピックを生成中...
        </Text>
      </Stack>
    );
  }

  if (topics.length === 0) {
    return (
      <ErrorRetryAlert
        color="gray"
        message="トピックを生成できませんでした。もう一度お試しください。"
        onRetry={() => void retry()}
        retryLabel="再生成する"
        title="トピックがありません"
      />
    );
  }

  return (
    <Radio.Group
      aria-label="トピックを選択"
      label="以下のトピックから 1 つ選んでください"
      labelProps={{ size: "md" }}
      onChange={(value) => field.handleChange(value)}
      size="md"
      value={field.state.value ?? ""}
    >
      <Stack gap="md" mt="md">
        {topics.map((topic, idx) => (
          <Radio key={idx} label={topic} styles={{ label: { lineHeight: 1.65 } }} value={topic} />
        ))}
      </Stack>
    </Radio.Group>
  );
}

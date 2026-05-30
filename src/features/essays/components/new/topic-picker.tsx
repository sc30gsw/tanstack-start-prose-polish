import { Alert, Button, Loader, Radio, Stack, Text } from "@mantine/core";

import { useDailyPrompt } from "~/features/essays/hooks/use-daily-prompt";

type TopicPickerProps = {
  field: {
    handleChange: (value: string | undefined) => void;
    state: { value: string | undefined };
  };
};

export function TopicPicker({ field }: TopicPickerProps) {
  const { error, isLoading, payload, retry } = useDailyPrompt("topic");
  const topics = Array.isArray(payload) ? (payload as string[]) : [];

  if (error) {
    return (
      <Alert color="red" title="トピックの生成に失敗しました" variant="light">
        <Stack align="flex-start" gap="sm">
          <Text size="md">{error}</Text>
          <Button onClick={() => void retry()} size="sm" variant="light">
            再生成する
          </Button>
        </Stack>
      </Alert>
    );
  }

  if (isLoading || topics.length === 0) {
    return (
      <Stack align="center" gap="md" py="lg">
        <Loader aria-label="トピックを生成中" size="md" />
        <Text c="dimmed" lh={1.65} size="md">
          AI がトピックを生成中...
        </Text>
      </Stack>
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

import { Loader, Radio, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { generateTopics } from "~/features/essay-feedback/api/mock-ai";

type TopicPickerProps = {
  field: {
    handleChange: (value: string | undefined) => void;
    state: { value: string | undefined };
  };
};

export function TopicPicker({ field }: TopicPickerProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    void generateTopics().then((result) =>
      result.match({
        err: () => setIsLoading(false),
        ok: (data) => {
          setTopics(data);
          setIsLoading(false);
        },
      }),
    );
  }, []);

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

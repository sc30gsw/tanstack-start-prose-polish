import { Paper, Stack, Text } from "@mantine/core";
import { ClientOnly } from "@tanstack/react-router";

import { TtsButton } from "~/features/essay-feedback/components/tts-button";

type ResultReaderProps = {
  correctedBody: string;
};

export function ResultReader({ correctedBody }: ResultReaderProps) {
  const paragraphs = correctedBody.split(/\n\n+/).filter(Boolean);

  return (
    <Stack gap="lg">
      <ClientOnly>
        <TtsButton text={correctedBody} />
      </ClientOnly>
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="lg">
          {paragraphs.map((para, idx) => (
            <Text
              key={idx}
              size="md"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                lineHeight: 2,
              }}
            >
              {para}
            </Text>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

import { Box, Paper, Select, SimpleGrid, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

import { TtsPlayControls } from "~/features/essay-feedback/components/tts-button";
import { TtsSyncedText } from "~/features/essay-feedback/components/tts-synced-text";
import { type TtsDisplayMode, useTts } from "~/features/essay-feedback/hooks/use-tts";

type ResultReaderProps = {
  correctedBody: string;
};

export function ResultReader({ correctedBody }: ResultReaderProps) {
  const theme = useMantineTheme();
  const isSmUp = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const ttsFullWidth = isSmUp === false;
  const {
    currentWordIndex,
    isPlaybackActive,
    isSupported,
    pause: pauseTts,
    play: playTts,
    playFromStart,
    playbackState,
    resetPlayback,
  } = useTts(correctedBody);
  const [displayMode, setDisplayMode] = useState<TtsDisplayMode>("aloud");

  return (
    <Paper p={0} radius="md" withBorder>
      <Stack gap={0}>
        <Box
          bg="var(--mantine-color-default-hover)"
          p="md"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
              <Select
                aria-describedby="result-reader-mode-hint"
                data={[
                  { value: "aloud", label: "音読" },
                  { value: "shadowing", label: "シャドーイング" },
                ]}
                label="表示モード"
                onChange={(v) => {
                  if (v == null) return;
                  setDisplayMode(v as TtsDisplayMode);
                  resetPlayback();
                }}
                size="sm"
                value={displayMode}
                w="100%"
              />
              <Box style={{ alignSelf: isSmUp ? "end" : "stretch" }} w="100%">
                <TtsPlayControls
                  fullWidth={ttsFullWidth}
                  isSupported={isSupported}
                  onPause={pauseTts}
                  onPlay={playTts}
                  onPlayFromStart={playFromStart}
                  playbackState={playbackState}
                />
              </Box>
            </SimpleGrid>
            <Text
              c="var(--mantine-color-text)"
              id="result-reader-mode-hint"
              size="sm"
              style={{ lineHeight: 1.5, maxWidth: "42em", opacity: 0.78 }}
            >
              音読は再生中の語を強調します。シャドーイングは、まだ読んでいない箇所を隠して練習できます
            </Text>
          </Stack>
        </Box>
        <Box p="xl">
          <TtsSyncedText
            currentWordIndex={currentWordIndex}
            displayMode={displayMode}
            isPlaying={isPlaybackActive}
            text={correctedBody}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

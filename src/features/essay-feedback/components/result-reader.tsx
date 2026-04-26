import type { InstaQLEntity } from "@instantdb/react";
import { cn } from "@lightsound/cn/tw-merge";
import {
  Avatar,
  Box,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useMantineTheme,
  type MantineColor,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

import { TtsPlayControls } from "~/features/essay-feedback/components/tts-button";
import { TtsSyncedText } from "~/features/essay-feedback/components/tts-synced-text";
import {
  type TtsAccent,
  type TtsDisplayMode,
  useTts,
} from "~/features/essay-feedback/hooks/use-tts";
import type { AppSchema } from "~/lib/instant-schema";

const ACCENT_OPTIONS = [
  { value: "american-female", label: "Samantha" },
  { value: "british-male", label: "Daniel" },
] as const satisfies { value: TtsAccent; label: string }[];

const ACCENT_AVATAR = {
  "american-female": { color: "pink", initials: "S" },
  "british-male": { color: "indigo", initials: "D" },
} as const satisfies Record<TtsAccent, { color: MantineColor; initials: string }>;

export function ResultReader({
  correctedBody,
}: Record<"correctedBody", NonNullable<InstaQLEntity<AppSchema, "essays">["bodyAfter"]>>) {
  const theme = useMantineTheme();
  const isSmUp = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const ttsFullWidth = isSmUp === false;
  const {
    accent,
    currentWordIndex,
    isPlaybackActive,
    isSupported,
    pause: pauseTts,
    play: playTts,
    playFromStart,
    playbackState,
    resetPlayback,
    setAccent,
  } = useTts(correctedBody);
  const [displayMode, setDisplayMode] = useState<TtsDisplayMode>("aloud");

  return (
    <Paper p={0} radius="md" withBorder>
      <Stack gap={0}>
        <Box
          bg="var(--mantine-color-default-hover)"
          p="md"
          className="border-default-border border-b"
        >
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" verticalSpacing="md">
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
              <Select
                data={ACCENT_OPTIONS}
                label="音声"
                leftSection={
                  <Avatar color={ACCENT_AVATAR[accent].color} radius="xl" size={20}>
                    {ACCENT_AVATAR[accent].initials}
                  </Avatar>
                }
                leftSectionWidth={36}
                onChange={(v) => {
                  if (v == null) return;
                  setAccent(v as TtsAccent);
                  resetPlayback();
                }}
                renderOption={({ option }) => {
                  const av = ACCENT_AVATAR[option.value as TtsAccent];
                  return (
                    <Group gap="xs">
                      <Avatar color={av.color} radius="xl" size={24}>
                        {av.initials}
                      </Avatar>
                      <Text size="sm">{option.label}</Text>
                    </Group>
                  );
                }}
                size="sm"
                value={accent}
                w="100%"
              />
              <Box w="100%" className={cn(isSmUp ? "self-end" : "self-stretch")}>
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
              className="line-height-1.5 max-w-[42em] opacity-78"
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

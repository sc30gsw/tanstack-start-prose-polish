import type { InstaQLEntity } from "@instantdb/react";
import { cn } from "@lightsound/cn/tw-merge";
import {
  Avatar,
  Box,
  Container,
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

import type { AppSchema } from "~/db/instant-schema";
import { TtsPlayControls } from "~/features/essays/components/tts-button";
import { TtsSyncedText } from "~/features/essays/components/tts-synced-text";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";
import { type TtsAccent, type TtsDisplayMode, useTts } from "~/features/essays/hooks/use-tts";

const ACCENT_OPTIONS = [
  { value: "american-female", label: "Samantha" },
  { value: "british-male", label: "Daniel" },
] as const satisfies { value: TtsAccent; label: string }[];

const ACCENT_AVATAR = {
  "american-female": { color: "pink", initials: "S" },
  "british-male": { color: "indigo", initials: "D" },
} as const satisfies Record<TtsAccent, { color: MantineColor; initials: string }>;

export function ResultReader({
  essayId,
}: Record<"essayId", NonNullable<InstaQLEntity<AppSchema, "essays">["id"]>>) {
  const { essay, isLoading, error } = useEssayDetail(essayId);
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
  } = useTts(essay?.bodyAfter ?? "");
  const [displayMode, setDisplayMode] = useState<TtsDisplayMode>("aloud");

  if (isLoading) {
    return (
      <Container py="xl" size="md">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  if (!essay || error) {
    return (
      <Container py="xl" size="md">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  if (!essay.bodyAfter) {
    return (
      <Container py="xl" size="md">
        <Text c="dimmed">添削中です。しばらくお待ちください...</Text>
      </Container>
    );
  }

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

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

import type { AppSchema } from "~/db/instant-schema";
import { TtsPlayControls } from "~/features/essays/components/result/tts-button";
import { TtsSyncedText } from "~/features/essays/components/result/tts-synced-text";
import { ACCENT_OPTIONS } from "~/features/essays/constants/result-reader";
import { useTts } from "~/features/essays/hooks/result/use-tts";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";
import { type EssayResultSearchParams } from "~/features/essays/schemas/search-params/essay-result-search-params";

const ACCENT_AVATAR = {
  [ACCENT_OPTIONS[0].value]: { color: "pink", initials: "S" },
  [ACCENT_OPTIONS[1].value]: { color: "indigo", initials: "D" },
} as const satisfies Record<
  (typeof ACCENT_OPTIONS)[number]["value"],
  { color: MantineColor; initials: string }
>;

type ResultReaderProps = {
  essayId: NonNullable<InstaQLEntity<AppSchema, "essays">["id"]>;
  accent: EssayResultSearchParams["accent"];
  onAccentChange: (accent: EssayResultSearchParams["accent"]) => void;
  mode: EssayResultSearchParams["mode"];
  onModeChange: (mode: EssayResultSearchParams["mode"]) => void;
};

export function ResultReader({
  essayId,
  accent,
  onAccentChange,
  mode,
  onModeChange,
}: ResultReaderProps) {
  const { essay, isLoading, error } = useEssayDetail(essayId);
  const theme = useMantineTheme();
  const isSmUp = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const {
    currentWordIndex,
    isPlaybackActive,
    isSupported,
    pause: pauseTts,
    play: playTts,
    playFromStart,
    playbackState,
    resetPlayback,
  } = useTts({ accent, text: essay?.bodyAfter ?? "" });

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
                  if (v == null) {
                    return;
                  }

                  onModeChange(v as EssayResultSearchParams["mode"]);

                  resetPlayback();
                }}
                size="sm"
                value={mode}
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
                  if (v == null) {
                    return;
                  }

                  onAccentChange(v as EssayResultSearchParams["accent"]);
                  resetPlayback();
                }}
                renderOption={({ option }) => {
                  const av = ACCENT_AVATAR[option.value as EssayResultSearchParams["accent"]];

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
                  fullWidth={isSmUp === false}
                  isSupported={isSupported}
                  pause={pauseTts}
                  play={playTts}
                  playFromStart={playFromStart}
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
            displayMode={mode}
            isPlaying={isPlaybackActive}
            text={essay.bodyAfter}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

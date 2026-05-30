import { cn } from "@lightsound/cn/tw-merge";
import { ActionIcon, Box, Button, Group, Tooltip } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

import { useTts } from "~/features/essays/hooks/result/use-tts";

type TtsPlayControlsProps = Partial<Record<"fullWidth", boolean>> &
  Pick<
    ReturnType<typeof useTts>,
    "isSupported" | "pause" | "play" | "playFromStart" | "playbackState"
  >;

export function TtsPlayControls({
  fullWidth = false,
  isSupported,
  pause,
  play,
  playFromStart,
  playbackState,
}: TtsPlayControlsProps) {
  if (!isSupported) {
    return (
      <Box className={cn("block", fullWidth ? "w-full" : "w-auto")}>
        <Tooltip label="このブラウザは TTS に対応していません">
          <span className={cn("block", fullWidth ? "w-full" : "w-auto")}>
            <Button
              color="teal"
              disabled
              fullWidth={fullWidth}
              leftSection={<IconPlayerPlay size={16} />}
              variant="light"
            >
              音声を再生
            </Button>
          </span>
        </Tooltip>
      </Box>
    );
  }

  const playLabel = playbackState === "paused" ? "再開" : "音声を再生";
  const isPlaying = playbackState === "playing";

  const refreshButton = (
    <Tooltip label="先頭から再生">
      <ActionIcon
        aria-label="先頭から再生"
        color="gray"
        onClick={playFromStart}
        size="input-sm"
        variant="default"
      >
        <IconRefresh size={18} />
      </ActionIcon>
    </Tooltip>
  );

  const mainButton = isPlaying ? (
    <Button
      aria-label="音声を一時停止"
      color="gray"
      fullWidth={fullWidth}
      leftSection={<IconPlayerPause size={16} />}
      onClick={pause}
      className={cn(fullWidth ? "min-w-0 flex-1" : undefined)}
      variant="default"
    >
      一時停止
    </Button>
  ) : (
    <Button
      aria-label={playbackState === "paused" ? "音声を再開" : "音声を再生"}
      color="teal"
      fullWidth={fullWidth}
      leftSection={<IconPlayerPlay size={16} />}
      onClick={play}
      className={cn(fullWidth ? "min-w-0 flex-1" : undefined)}
      variant="filled"
    >
      {playLabel}
    </Button>
  );

  return fullWidth ? (
    <Group align="center" gap="sm" w="100%" wrap="nowrap">
      {mainButton}
      {refreshButton}
    </Group>
  ) : (
    <Group gap="sm" wrap="wrap">
      {mainButton}
      {refreshButton}
    </Group>
  );
}

import { cn } from "@lightsound/cn/tw-merge";
import { ActionIcon, Box, Button, Group, Tooltip } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

import { type TtsPlaybackState, useTts } from "~/features/essay-feedback/hooks/use-tts";

type TtsPlayControlsProps = {
  fullWidth?: boolean;
  isSupported: boolean;
  /** Combobox で読み上げ音声が未選択のときなど */
  playbackDisabled?: boolean;
  onPause: () => void;
  onPlay: () => void;
  onPlayFromStart: () => void;
  playbackState: TtsPlaybackState;
};

export function TtsPlayControls({
  fullWidth = false,
  isSupported,
  playbackDisabled = false,
  onPause,
  onPlay,
  onPlayFromStart,
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

  if (playbackDisabled) {
    const disabledMain = (
      <Button
        color="teal"
        disabled
        fullWidth={fullWidth}
        leftSection={<IconPlayerPlay size={16} />}
        style={fullWidth ? { flex: 1, minWidth: 0 } : undefined}
        variant="filled"
      >
        音声を再生
      </Button>
    );
    const disabledRefresh = (
      <ActionIcon aria-label="先頭から再生" color="gray" disabled size="input-sm" variant="default">
        <IconRefresh size={18} />
      </ActionIcon>
    );
    if (fullWidth) {
      return (
        <Tooltip label="読み上げ音声を選ぶと再生できます">
          <Group align="center" aria-disabled gap="sm" w="100%" wrap="nowrap">
            {disabledMain}
            {disabledRefresh}
          </Group>
        </Tooltip>
      );
    }
    return (
      <Tooltip label="読み上げ音声を選ぶと再生できます">
        <Group aria-disabled gap="sm" wrap="wrap">
          {disabledMain}
          {disabledRefresh}
        </Group>
      </Tooltip>
    );
  }

  const playLabel = playbackState === "paused" ? "再開" : "音声を再生";
  const isPlaying = playbackState === "playing";

  const refreshButton = (
    <Tooltip label="先頭から再生">
      <ActionIcon
        aria-label="先頭から再生"
        color="gray"
        onClick={onPlayFromStart}
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
      onClick={onPause}
      style={fullWidth ? { flex: 1, minWidth: 0 } : undefined}
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
      onClick={onPlay}
      style={fullWidth ? { flex: 1, minWidth: 0 } : undefined}
      variant="filled"
    >
      {playLabel}
    </Button>
  );

  if (fullWidth) {
    return (
      <Group align="center" gap="sm" w="100%" wrap="nowrap">
        {mainButton}
        {refreshButton}
      </Group>
    );
  }

  return (
    <Group gap="sm" wrap="wrap">
      {mainButton}
      {refreshButton}
    </Group>
  );
}

type TtsButtonProps = {
  text: string;
};

export function TtsButton({ text }: TtsButtonProps) {
  const { isSupported, pause, play, playbackDisabled, playFromStart, playbackState } = useTts(text);
  return (
    <TtsPlayControls
      isSupported={isSupported}
      onPause={pause}
      onPlay={play}
      onPlayFromStart={playFromStart}
      playbackDisabled={playbackDisabled}
      playbackState={playbackState}
    />
  );
}

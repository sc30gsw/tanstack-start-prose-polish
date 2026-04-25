import { Button, Group, Text, Tooltip } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";

import { useTts } from "~/features/essay-feedback/hooks/use-tts";

type TtsPlayControlsProps = {
  isPlaying: boolean;
  isSupported: boolean;
  play: () => void;
  stop: () => void;
};

export function TtsPlayControls({ isSupported, isPlaying, play, stop }: TtsPlayControlsProps) {
  if (!isSupported) {
    return (
      <Tooltip label="このブラウザは TTS に対応していません">
        <Button disabled leftSection={<IconPlayerPlay size={16} />} variant="light">
          音声を再生
        </Button>
      </Tooltip>
    );
  }

  return (
    <Group gap="xs">
      {isPlaying ? (
        <Button
          aria-label="音声を停止"
          leftSection={<IconPlayerPause size={16} />}
          onClick={stop}
          variant="light"
        >
          停止
        </Button>
      ) : (
        <Button
          aria-label="音声を再生"
          leftSection={<IconPlayerPlay size={16} />}
          onClick={play}
          variant="light"
        >
          音声を再生
        </Button>
      )}
      {isPlaying && (
        <Text c="dimmed" size="sm">
          再生中...
        </Text>
      )}
    </Group>
  );
}

type TtsButtonProps = {
  text: string;
};

export function TtsButton({ text }: TtsButtonProps) {
  const { isSupported, isPlaying, play, stop } = useTts(text);
  return (
    <TtsPlayControls isPlaying={isPlaying} isSupported={isSupported} play={play} stop={stop} />
  );
}

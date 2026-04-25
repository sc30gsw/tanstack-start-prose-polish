import { Group, SegmentedControl, Stack } from "@mantine/core";
import { useState } from "react";

import { TtsPlayControls } from "~/features/essay-feedback/components/tts-button";
import { TtsSyncedText } from "~/features/essay-feedback/components/tts-synced-text";
import { type TtsDisplayMode, useTts } from "~/features/essay-feedback/hooks/use-tts";

type ResultReaderProps = {
  correctedBody: string;
};

export function ResultReader({ correctedBody }: ResultReaderProps) {
  const { currentWordIndex, isPlaying, isSupported, play, stop } = useTts(correctedBody);
  const [displayMode, setDisplayMode] = useState<TtsDisplayMode>("aloud");

  return (
    <Stack gap="lg">
      <Group align="center" wrap="wrap">
        <TtsPlayControls isPlaying={isPlaying} isSupported={isSupported} play={play} stop={stop} />
        <SegmentedControl
          aria-label="音声とあわせた表示（音読は発話中を強調、シャドーイングは未発音だけ非表示）"
          data={[
            { label: "音読", value: "aloud" },
            { label: "シャドーイング", value: "shadowing" },
          ]}
          onChange={(v) => {
            setDisplayMode(v as TtsDisplayMode);
          }}
          size="sm"
          value={displayMode}
        />
      </Group>
      <TtsSyncedText
        currentWordIndex={currentWordIndex}
        displayMode={displayMode}
        isPlaying={isPlaying}
        text={correctedBody}
      />
    </Stack>
  );
}

import { Stack, Text } from "@mantine/core";
import type { CSSProperties } from "react";

import type { TtsDisplayMode } from "~/features/essays/hooks/result/use-tts";

const BODY_STYLE = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  lineHeight: 2,
} as const;

type TtsSyncedTextProps = {
  currentWordIndex: number;
  displayMode: TtsDisplayMode;
  isPlaying: boolean;
  text: string;
};

function countWordsInBlock(block: string) {
  return block.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * 全文をパラグラフ表示し、TTS の currentWordIndex と同一の方法（空白区切り）で
 * 単語を走査して同期スタイルを当てる。
 */
export function TtsSyncedText({
  text,
  currentWordIndex,
  isPlaying,
  displayMode,
}: TtsSyncedTextProps) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <Stack gap="lg">
      {paragraphs.map((para, pIdx) => {
        const words = para.split(/\s+/).filter((w) => w.length > 0);
        const wordOffset = paragraphs
          .slice(0, pIdx)
          .reduce((sum, block) => sum + countWordsInBlock(block), 0);

        return (
          <Text key={pIdx} component="p" size="md" style={BODY_STYLE}>
            {words.map((word, wIdx) => {
              const globalIndex = wordOffset + wIdx;

              return (
                <span key={`${pIdx}-${wIdx}`}>
                  {wIdx > 0 ? " " : null}
                  <span
                    style={getWordStyle({
                      currentWordIndex,
                      displayMode,
                      globalIndex,
                      isPlaying,
                    })}
                  >
                    {word}
                  </span>
                </span>
              );
            })}
          </Text>
        );
      })}
    </Stack>
  );
}

function getWordStyle({
  currentWordIndex,
  displayMode,
  globalIndex,
  isPlaying,
}: {
  currentWordIndex: number;
  displayMode: TtsDisplayMode;
  globalIndex: number;
  isPlaying: boolean;
}): CSSProperties {
  if (!isPlaying) {
    return { transition: "opacity 0.15s ease" };
  }

  if (displayMode === "aloud") {
    const isCurrent = globalIndex === currentWordIndex;
    const isFuture = globalIndex > currentWordIndex;
    if (isCurrent) {
      // 太字・padding 等は改行位置が動く原因になるため、下線＋色のみ
      return {
        color: "var(--mantine-color-blue-8)",
        textDecoration: "underline",
        textDecorationColor: "var(--mantine-color-yellow-5)",
        textDecorationSkipInk: "auto",
        textDecorationThickness: "0.1em",
        textUnderlineOffset: "0.15em",
        transition: "opacity 0.15s ease, color 0.15s ease",
      };
    }
    if (isFuture) {
      return { opacity: 0.4, transition: "opacity 0.15s ease" };
    }
    return { opacity: 0.75, transition: "opacity 0.15s ease" };
  }

  // シャドーイング: 未発音だけ非表示、発音済み＋今は常に表示
  const isCurrent = globalIndex === currentWordIndex;
  if (isCurrent) {
    return {
      color: "var(--mantine-color-blue-8)",
      textDecoration: "underline",
      textDecorationColor: "var(--mantine-color-yellow-5)",
      textDecorationSkipInk: "auto",
      textDecorationThickness: "0.1em",
      textUnderlineOffset: "0.15em",
      transition: "opacity 0.12s ease, color 0.12s ease",
    };
  }
  if (globalIndex < currentWordIndex) {
    return { opacity: 1, transition: "opacity 0.12s ease" };
  }
  return { opacity: 0, transition: "opacity 0.12s ease" };
}

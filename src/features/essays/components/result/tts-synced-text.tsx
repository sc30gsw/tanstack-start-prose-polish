import type { InstaQLEntity } from "@instantdb/react";
import { cn } from "@lightsound/cn/tw-merge";
import { Stack, Text } from "@mantine/core";
import { sumBy } from "es-toolkit";

import type { AppSchema } from "~/db/instant-schema";
import type { useTts } from "~/features/essays/hooks/result/use-tts";
import type { EssayResultSearchParams } from "~/features/essays/schemas/search-params/essay-result-search-params";

function countWordsInBlock(block: string) {
  return block.split(/\s+/).filter((w) => w.length > 0).length;
}

type TtsSyncedTextProps = {
  currentWordIndex: ReturnType<typeof useTts>["currentWordIndex"];
  displayMode: EssayResultSearchParams["mode"];
  isPlaying: ReturnType<typeof useTts>["isPlaybackActive"];
  text: NonNullable<InstaQLEntity<AppSchema, "essays">["bodyAfter"]>;
};

export function TtsSyncedText({
  text,
  currentWordIndex,
  isPlaying,
  displayMode,
}: TtsSyncedTextProps) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <Stack gap="lg">
      {paragraphs.map((paragraph, pIdx) => {
        const words = paragraph.split(/\s+/).filter((w) => w.length > 0);
        const wordOffset = sumBy(paragraphs.slice(0, pIdx), countWordsInBlock);

        return (
          <Text
            key={pIdx}
            component="p"
            size="md"
            className="font-serif text-[15px] leading-8 sm:text-[16px]"
          >
            {words.map((word, wIdx) => {
              const globalIndex = wordOffset + wIdx;
              const isCurrent = globalIndex === currentWordIndex;
              const isFuture = globalIndex > currentWordIndex;
              const isAloud = displayMode === "aloud";
              const isShadowing = displayMode !== "aloud";
              const isPast = globalIndex < currentWordIndex;

              return (
                <span key={`${pIdx}-${wIdx}`}>
                  {wIdx > 0 ? " " : null}
                  <span
                    className={cn(
                      "transition-opacity",
                      "ease-in-out",
                      isPlaying ? (isAloud ? "duration-150" : "duration-100") : "duration-150",
                      isPlaying && isCurrent
                        ? "text-blue-700 underline decoration-yellow-400 decoration-2 underline-offset-[0.15em] transition-[opacity,color]"
                        : null,
                      isPlaying && isAloud && !isCurrent && isFuture ? "opacity-40" : null,
                      isPlaying && isAloud && !isCurrent && !isFuture ? "opacity-75" : null,
                      isPlaying && isShadowing && !isCurrent && isPast ? "opacity-100" : null,
                      isPlaying && isShadowing && !isCurrent && !isPast ? "opacity-0" : null,
                    )}
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

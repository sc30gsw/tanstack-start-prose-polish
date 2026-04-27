import { DonutChart } from "@mantine/charts";
import { Stack, Text, type MantineColor } from "@mantine/core";

import { CEFR_TOEIC_BANDS, SCORE_CEFR } from "~/features/essays/constants/essay";
import type { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";

type ScoreDonutChartProps = Pick<
  NonNullable<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>["scoring"]>,
  "cefr" | "score"
>;

export function ScoreDonutChart({ cefr, score }: ScoreDonutChartProps) {
  const band = CEFR_TOEIC_BANDS[cefr as (typeof SCORE_CEFR)[number]];
  const scoreData = [
    { color: band.color, name: "スコア", value: score },
    { color: "gray.2", name: "残り", value: 100 - score },
  ] as const satisfies {
    color: MantineColor;
    name: string;
    value: ScoreDonutChartProps["score"];
  }[];

  return (
    <Stack align="center" gap={4}>
      <DonutChart
        chartLabel={`${score} / 100`}
        data={scoreData}
        paddingAngle={2}
        size={180}
        thickness={28}
        tooltipDataSource="segment"
        valueFormatter={(v) => `${v} 点`}
        withTooltip
      />
      <Text c="dimmed" size="xs">
        ライティングスコア
      </Text>
    </Stack>
  );
}

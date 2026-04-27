import { RadarChart } from "@mantine/charts";
import { Paper, Stack, Text } from "@mantine/core";

import { SCORE_CEFR } from "~/features/essays/constants/essay";

type ScoreCefr = (typeof SCORE_CEFR)[number];

const CEFR_TO_NUMERIC = {
  A1: 10,
  A2: 25,
  B1: 45,
  B2: 65,
  C1: 85,
  C2: 100,
} as const satisfies Record<ScoreCefr, number>;

type EssayScoringSummaryChartProps = {
  cefr: ScoreCefr;
  score: number;
  toeicMax: number;
  toeicMin: number;
};

export function EssayScoringSummaryChart({
  cefr,
  score,
  toeicMax,
  toeicMin,
}: EssayScoringSummaryChartProps) {
  const toeicMidNormalized = ((toeicMin + toeicMax) / 2 / 990) * 100;

  const data = [
    { metric: "点数", value: score },
    { metric: "CEFR", value: CEFR_TO_NUMERIC[cefr] },
    { metric: "TOEIC", value: toeicMidNormalized },
  ];

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Text fw={600} size="md">
          スコアサマリー
        </Text>
        <RadarChart
          data={data}
          dataKey="metric"
          h={280}
          series={[{ color: "blue.5", name: "value", opacity: 0.3 }]}
          withPolarRadiusAxis
        />
      </Stack>
    </Paper>
  );
}

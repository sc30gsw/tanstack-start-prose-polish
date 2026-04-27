import { RadarChart } from "@mantine/charts";
import { Container, Paper, Stack, Text } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";

import { SCORE_CEFR } from "~/features/essays/constants/essay";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";

type ScoreCefr = (typeof SCORE_CEFR)[number];

const CEFR_TO_NUMERIC = {
  A1: 10,
  A2: 25,
  B1: 45,
  B2: 65,
  C1: 85,
  C2: 100,
} as const satisfies Record<ScoreCefr, number>;

const routeApi = getRouteApi("/_authenticated/essays/$essayId/history");

export function EssayScoringSummaryChart() {
  const { essayId } = routeApi.useParams();
  const { essay, isLoading, error } = useEssayDetail(essayId);

  if (isLoading) {
    return (
      <Container py="xl" size="md">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  if (!essay || error || !essay.scoring) {
    return (
      <Container py="xl" size="md">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  const summary = {
    cefr: essay.scoring.cefr as (typeof SCORE_CEFR)[number],
    score: essay.scoring.score,
    toeicMax: essay.scoring.toeicMax,
    toeicMin: essay.scoring.toeicMin,
  };

  const toeicMidNormalized = ((essay.scoring.toeicMin + essay.scoring.toeicMax) / 2 / 990) * 100;

  const data = [
    { metric: "点数", value: summary.score },
    { metric: "CEFR", value: CEFR_TO_NUMERIC[summary.cefr] },
    { metric: "TOEIC", value: toeicMidNormalized },
  ] as const satisfies { metric: string; value: number }[];

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

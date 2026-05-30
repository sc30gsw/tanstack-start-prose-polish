import { Container, Group, Stack, Text } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";

import { CefrToeicBands } from "~/features/essays/components/history/cefr-toeic-bands";
import { ScoreDonutChart } from "~/features/essays/components/history/score-donut-chart";
import { SummaryBadges } from "~/features/essays/components/history/summary-badges";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";

const routeApi = getRouteApi("/_authenticated/essays/$essayId/history");

export function EssayScoringSummaryContainer() {
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

  return (
    <>
      <Group align="flex-start" gap="xl" wrap="wrap">
        <ScoreDonutChart cefr={essay.scoring.cefr} score={essay.scoring.score} />
        <Stack gap="md" style={{ flex: 1, minWidth: 240 }}>
          <SummaryBadges
            cefr={essay.scoring.cefr}
            toeicMax={essay.scoring.toeicMax}
            toeicMin={essay.scoring.toeicMin}
          />
          <Stack gap={4}>
            <Text fw={500} size="sm">
              フィードバック
            </Text>
            <Text c="dimmed" size="sm">
              {essay.scoring.scoreFeedback}
            </Text>
          </Stack>
        </Stack>
      </Group>
      <CefrToeicBands
        cefr={essay.scoring.cefr}
        toeicMax={essay.scoring.toeicMax}
        toeicMin={essay.scoring.toeicMin}
      />
    </>
  );
}

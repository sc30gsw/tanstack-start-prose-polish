import { Container, Stack } from "@mantine/core";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { PageHeader } from "~/components/page-header";
import { EssayScoringSummaryChart } from "~/features/essays/components/history/essay-scoring-summary-chart";
import { HistoryDetailTabs } from "~/features/essays/components/history/history-detail-tabs";
import { SCORE_CEFR } from "~/features/essays/constants/essay";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";
import {
  defaultEssayHistoriesSearchParams,
  essayHistoriesSearchSchema,
} from "~/features/essays/schemas/search-params/essay-histories-search-params";

export const Route = createFileRoute("/_authenticated/essays/$essayId/history")({
  component: HistoryPage,
  validateSearch: valibotValidator(essayHistoriesSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultEssayHistoriesSearchParams)],
  },
});

function HistoryPage() {
  const { essayId } = Route.useParams();
  const { essay } = useEssayDetail(essayId);

  const scoring = essay?.scoring ?? null;
  const summary =
    scoring != null
      ? {
          cefr: scoring.cefr as (typeof SCORE_CEFR)[number],
          score: scoring.score,
          toeicMax: scoring.toeicMax,
          toeicMin: scoring.toeicMin,
        }
      : null;

  return (
    <Container py="xl" size="xl">
      <Stack gap="lg">
        <PageHeader backLink={<Link to="/essays">学習履歴一覧</Link>} title="学習履歴詳細" />
        {summary && <EssayScoringSummaryChart {...summary} />}
        <HistoryDetailTabs />
      </Stack>
    </Container>
  );
}

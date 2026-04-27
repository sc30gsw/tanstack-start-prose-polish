import { Container, Stack } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { PageHeader } from "~/components/page-header";
import { EssayScoringSummaryChart } from "~/features/essay-feedback/components/essay-scoring-summary-chart";
import { HistoryDetailTabs } from "~/features/essay-feedback/components/history-detail-tabs";
import { SCORE_CEFR } from "~/features/essay-feedback/constants/essay";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";
import {
  defaultEssayHistoriesSearchParams,
  essayHistoriesSearchSchema,
} from "~/features/essay-feedback/schemas/search-params/essay-histories-search-params";
import { isEveryNonNull } from "~/lib/every-non-null";

type ScoreCefr = (typeof SCORE_CEFR)[number];

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

  const summary = essay
    ? (() => {
        const scoring = [
          essay.score,
          essay.scoreFeedback,
          essay.cefr,
          essay.toeicMin,
          essay.toeicMax,
        ] as const;

        if (!isEveryNonNull(scoring)) {
          return null;
        }

        const [score, , cefr, toeicMin, toeicMax] = scoring;

        return {
          cefr: cefr as ScoreCefr,
          score,
          toeicMax,
          toeicMin,
        };
      })()
    : null;

  return (
    <Container py="xl" size="xl">
      <Stack gap="lg">
        <PageHeader backHref="/essays" backLabel="履歴一覧" title="学習履歴詳細" />
        {summary && <EssayScoringSummaryChart {...summary} />}
        <HistoryDetailTabs />
      </Stack>
    </Container>
  );
}

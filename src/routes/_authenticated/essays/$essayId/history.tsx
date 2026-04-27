import { Container, Skeleton, Stack } from "@mantine/core";
import { ClientOnly, createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { PageHeader } from "~/components/page-header";
import { EssayScoringSummaryChart } from "~/features/essays/components/history/essay-scoring-summary-chart";
import { HistoryDetailTabs } from "~/features/essays/components/history/history-detail-tabs";
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
  return (
    <Container py="xl" size="xl">
      <Stack gap="lg">
        <PageHeader backLink={<Link to="/essays">学習履歴一覧</Link>} title="学習履歴詳細" />
        <ClientOnly fallback={<Skeleton height={280} radius="md" />}>
          <EssayScoringSummaryChart />
        </ClientOnly>
        <HistoryDetailTabs />
      </Stack>
    </Container>
  );
}

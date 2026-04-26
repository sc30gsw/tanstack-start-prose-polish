import { Container } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { PageHeader } from "~/components/page-header";
import { HistoryDetailTabs } from "~/features/essay-feedback/components/history-detail-tabs";
import {
  defaultEssayHistoriesSearchParams,
  essayHistoriesSearchSchema,
} from "~/features/essay-feedback/schemas/search-params/essay-histories-search-params";

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
      <PageHeader backHref="/essays" backLabel="履歴一覧" title="学習履歴詳細" />
      <HistoryDetailTabs />
    </Container>
  );
}

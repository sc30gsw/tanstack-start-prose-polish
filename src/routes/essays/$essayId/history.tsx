import { Container, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";

import { PageHeader } from "~/components/page-header";
import { HistoryDetailTabs } from "~/features/essay-feedback/components/history-detail-tabs";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";
import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";

const HistorySearchSchema = v.object({
  tab: v.optional(v.picklist(["before", "diff", "after"]), "before"),
  view: v.optional(v.picklist(["split", "unified"]), "split"),
});

export const Route = createFileRoute("/essays/$essayId/history")({
  component: HistoryPage,
  validateSearch: (search) => v.parse(HistorySearchSchema, search),
});

function HistoryPage() {
  const { essayId } = Route.useParams();
  const { tab, view } = Route.useSearch();
  const { essay, isLoading } = useEssayDetail(essayId);

  if (isLoading) {
    return (
      <Container py="xl" size="xl">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  const essayData = essay as {
    bodyAfter?: null | string;
    bodyBefore?: string;
    comments?: unknown[];
  } | null;

  if (essayData == null || essayData.bodyBefore == null) {
    return (
      <Container py="xl" size="xl">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  const comments = (essayData.comments ?? []).map((c) => c as DiffComment);

  return (
    <Container py="xl" size="xl">
      <PageHeader backHref="/" backLabel="履歴一覧" title="学習履歴詳細" />
      <HistoryDetailTabs
        bodyAfter={essayData.bodyAfter}
        bodyBefore={essayData.bodyBefore}
        comments={comments}
        essayId={essayId}
        tab={tab}
        view={view}
      />
    </Container>
  );
}

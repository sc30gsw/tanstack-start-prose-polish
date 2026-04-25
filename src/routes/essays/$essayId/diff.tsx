import { Button, Container, Group, SegmentedControl, Skeleton, Stack, Text } from "@mantine/core";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import * as v from "valibot";

import { PageHeader } from "~/components/page-header";
import { DiffView } from "~/features/essay-feedback/components/diff-view";
import { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";
import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";

const DiffSearchSchema = v.object({
  view: v.optional(v.picklist(["split", "unified"]), "split"),
});

export const Route = createFileRoute("/essays/$essayId/diff")({
  component: DiffPage,
  validateSearch: (search) => v.parse(DiffSearchSchema, search),
});

function DiffPage() {
  const { essayId } = Route.useParams();
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: "/essays/$essayId/diff" });
  const { essay, isLoading } = useEssayDetail(essayId);
  const { comments, addComment } = useDiffComments(essayId);

  const handleViewChange = (value: string) => {
    void navigate({
      params: { essayId },
      search: (prev) => ({ ...prev, view: value as "split" | "unified" }),
    });
  };

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
  } | null;

  if (essayData == null || essayData.bodyBefore == null) {
    return (
      <Container py="xl" size="xl">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  if (essayData.bodyAfter == null) {
    return (
      <Container py="xl" size="xl">
        <Text c="dimmed">添削中です。しばらくお待ちください...</Text>
      </Container>
    );
  }

  const typedComments = (comments as unknown[]).map((c) => c as DiffComment);

  return (
    <Container py="xl" size="xl">
      <PageHeader backHref="/" backLabel="履歴一覧" title="添削 Diff" />
      <Stack gap="lg">
        <Group justify="space-between">
          <SegmentedControl
            aria-label="表示モード"
            data={[
              { label: "Split", value: "split" },
              { label: "Unified", value: "unified" },
            ]}
            onChange={handleViewChange}
            value={view}
          />
          <Group gap="sm">
            <Button
              onClick={() => void navigate({ params: { essayId }, to: "/essays/$essayId/result" })}
              size="sm"
              variant="filled"
            >
              添削後を読む →
            </Button>
          </Group>
        </Group>
        <ClientOnly
          fallback={
            <Skeleton aria-busy="true" aria-label="Diff を読み込み中" height={400} radius="md" />
          }
        >
          <DiffView
            key={`${essayData.bodyAfter.length}-${essayData.bodyBefore.length}-${view}`}
            afterText={essayData.bodyAfter}
            beforeText={essayData.bodyBefore}
            comments={typedComments}
            diffStyle={view}
            onAddComment={addComment}
          />
        </ClientOnly>
      </Stack>
    </Container>
  );
}

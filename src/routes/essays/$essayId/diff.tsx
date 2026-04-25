import { Button, Container, Group, SegmentedControl, Skeleton, Stack, Text } from "@mantine/core";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import * as v from "valibot";

import { PageHeader } from "~/components/page-header";
import { DiffView } from "~/features/essay-feedback/components/diff-view";
import {
  DIFF_VIEW_MODE_CONTROL_LABEL,
  DIFF_VIEW_MODE_OPTIONS,
} from "~/features/essay-feedback/constants/diff-view-ui";
import { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";
import { useResolvedDiffView } from "~/features/essay-feedback/hooks/use-resolved-diff-view";
import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";

const DiffSearchSchema = v.object({
  view: v.optional(v.picklist(["split", "unified"])),
});

export const Route = createFileRoute("/essays/$essayId/diff")({
  component: DiffPage,
  validateSearch: (search) => v.parse(DiffSearchSchema, search),
});

function DiffPage() {
  const { essayId } = Route.useParams();
  const { view: viewParam } = Route.useSearch();
  const view = useResolvedDiffView(viewParam);
  const navigate = useNavigate({ from: "/essays/$essayId/diff" });
  const { essay, isLoading } = useEssayDetail(essayId);
  const { addComment, comments, removeUserComment, updateUserComment } = useDiffComments(essayId);

  const handleViewChange = (value: string) => {
    if (value !== "split" && value !== "unified") return;
    void navigate({
      params: { essayId },
      search: (prev) => ({ ...prev, view: value }),
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

  const goToResult = () => {
    void navigate({ params: { essayId }, to: "/essays/$essayId/result" });
  };

  return (
    <Container py="xl" size="xl">
      <PageHeader
        backHref="/"
        backLabel="履歴一覧"
        endSection={
          <Button onClick={goToResult} size="sm" variant="filled">
            添削後を読む →
          </Button>
        }
        title="添削結果"
      />
      <Stack gap="lg">
        <Group justify="center" w="100%" wrap="nowrap">
          <SegmentedControl
            aria-label={DIFF_VIEW_MODE_CONTROL_LABEL}
            data={DIFF_VIEW_MODE_OPTIONS.map(({ label, value }) => ({ label, value }))}
            fullWidth
            maw={560}
            onChange={handleViewChange}
            size="md"
            value={view}
            w="100%"
          />
        </Group>
        <ClientOnly
          fallback={
            <Skeleton aria-busy="true" aria-label="差分を読み込み中" height={400} radius="md" />
          }
        >
          <DiffView
            key={`${essayData.bodyAfter.length}-${essayData.bodyBefore.length}-${view}`}
            afterText={essayData.bodyAfter}
            beforeText={essayData.bodyBefore}
            comments={typedComments}
            diffStyle={view}
            onAddComment={addComment}
            onDeleteUserComment={removeUserComment}
            onUpdateUserComment={updateUserComment}
          />
        </ClientOnly>
        <Group justify="flex-end" mt="md" wrap="nowrap">
          <Button onClick={goToResult} size="sm" variant="filled">
            添削後を読む →
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

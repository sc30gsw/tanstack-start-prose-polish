import { Button, Container, Group, SegmentedControl, Skeleton, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
  ClientOnly,
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import * as v from "valibot";

import { PageHeader } from "~/components/page-header";
import { DiffView } from "~/features/essay-feedback/components/diff-view";
import { DIFF_VIEW_MODE_OPTIONS } from "~/features/essay-feedback/constants/diff-view-ui";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";
import { useResolvedDiffView } from "~/features/essay-feedback/hooks/use-resolved-diff-view";

const defaultDiffSearchParams = {
  view: "split",
} as const satisfies Record<string, (typeof DIFF_VIEW_MODE_OPTIONS)[number]["value"]>;

const diffSearchSchema = v.object({
  view: v.optional(v.picklist(["split", "unified"]), defaultDiffSearchParams.view),
});

export type DiffSearchParams = v.InferOutput<typeof diffSearchSchema>;

export const Route = createFileRoute("/essays/$essayId/diff")({
  component: DiffPage,
  validateSearch: valibotValidator(diffSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultDiffSearchParams)],
  },
});

function DiffPage() {
  const { essayId } = Route.useParams();

  return (
    <Container py="xl" size="xl">
      <PageHeader backHref="/essays" backLabel="履歴一覧" title="添削結果">
        <Button
          size="sm"
          variant="filled"
          renderRoot={(props) => (
            <Link to="/essays/$essayId/result" params={{ essayId }} {...props} />
          )}
        >
          添削後を読む <IconArrowRight size={16} />
        </Button>
      </PageHeader>
      <Stack gap="lg">
        <Group justify="center" w="100%" wrap="nowrap">
          <DiffSegmentControl />
        </Group>
        <ClientOnly
          fallback={
            <Skeleton aria-busy="true" aria-label="差分を読み込み中" height={400} radius="md" />
          }
        >
          <DiffViewContainer />
        </ClientOnly>
        <Group justify="flex-end" mt="md" wrap="nowrap">
          <Button
            size="sm"
            variant="filled"
            renderRoot={(props) => (
              <Link to="/essays/$essayId/result" params={{ essayId }} {...props} />
            )}
          >
            添削後を読む →
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

function DiffSegmentControl() {
  const { essayId } = Route.useParams();
  const { view: viewParam } = Route.useSearch();
  const view = useResolvedDiffView(viewParam);
  const navigate = useNavigate({ from: "/essays/$essayId/diff" });

  const handleViewChange = (value: string) => {
    if (value !== "split" && value !== "unified") return;
    navigate({
      params: { essayId },
      search: (prev) => ({ ...prev, view: value }),
    });
  };

  return (
    <SegmentedControl
      aria-label="見方を切り替え"
      data={DIFF_VIEW_MODE_OPTIONS.map(({ label, value }) => ({ label, value }))}
      fullWidth
      maw={560}
      onChange={handleViewChange}
      size="md"
      value={view}
      w="100%"
    />
  );
}

function DiffViewContainer() {
  const { essayId } = Route.useParams();
  const { view: viewParam } = Route.useSearch();
  const view = useResolvedDiffView(viewParam);

  const { essay, isLoading } = useEssayDetail(essayId);

  if (isLoading) {
    return (
      <Container py="xl" size="xl">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  if (!essay || !essay.bodyBefore) {
    return (
      <Container py="xl" size="xl">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  if (!essay.bodyAfter) {
    return (
      <Container py="xl" size="xl">
        <Text c="dimmed">添削中です。しばらくお待ちください...</Text>
      </Container>
    );
  }

  return (
    <DiffView
      key={`${essay.bodyAfter.length}-${essay.bodyBefore.length}-${view}`}
      afterText={essay.bodyAfter}
      beforeText={essay.bodyBefore}
      diffStyle={view}
      essayId={essayId}
    />
  );
}

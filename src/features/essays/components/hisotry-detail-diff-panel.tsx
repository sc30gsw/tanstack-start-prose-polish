import { Group, SegmentedControl, Skeleton, Stack, Tabs, Text } from "@mantine/core";
import { ClientOnly, getRouteApi } from "@tanstack/react-router";

import { DiffView } from "~/features/essays/components/diff-view";
import { DIFF_VIEW_MODE_OPTIONS } from "~/features/essays/constants/diff-view-ui";
import { useDiffComments } from "~/features/essays/hooks/use-diff-comments";
import type { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";
import { useResolvedDiffView } from "~/features/essays/hooks/use-resolved-diff-view";
import type { DiffSearchParams } from "~/features/essays/schemas/search-params/essay-diff-search-params";

const routeApi = getRouteApi("/_authenticated/essays/$essayId/history");

export function HistoryDetailDiffPanel({
  bodyAfter,
  bodyBefore,
}: Pick<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>, "bodyAfter" | "bodyBefore">) {
  const { view } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const diffView = useResolvedDiffView(view);

  if (!bodyAfter) {
    return (
      <Tabs.Panel value="diff">
        <Text c="dimmed" mt="md">
          添削後の文章がまだありません
        </Text>
      </Tabs.Panel>
    );
  }

  return (
    <Tabs.Panel value="diff">
      <Stack gap="md" mt="md">
        <Group justify="center" w="100%" wrap="nowrap">
          <SegmentedControl
            aria-label="見方を切り替え"
            data={DIFF_VIEW_MODE_OPTIONS.map(({ label, value }) => ({ label, value }))}
            fullWidth
            maw={560}
            onChange={(value) => {
              if (!value) {
                return;
              }

              navigate({
                search: (prev) => ({ ...prev, view: value as DiffSearchParams["view"] }),
              });
            }}
            size="sm"
            value={diffView}
            w="100%"
          />
        </Group>
        <HistoryDetailDiffViewContainer bodyAfter={bodyAfter} bodyBefore={bodyBefore} />
      </Stack>
    </Tabs.Panel>
  );
}

function HistoryDetailDiffViewContainer({
  bodyAfter,
  bodyBefore,
}: Parameters<typeof HistoryDetailDiffPanel>[0]) {
  const { essayId } = routeApi.useParams();
  const { isLoading } = useDiffComments(essayId);
  const { view } = routeApi.useSearch();

  const diffView = useResolvedDiffView(view);

  return isLoading ? (
    <Skeleton aria-busy="true" aria-label="指摘を読み込み中" height={400} radius="md" />
  ) : (
    <ClientOnly
      fallback={
        <Skeleton aria-busy="true" aria-label="差分を読み込み中" height={400} radius="md" />
      }
    >
      <DiffView
        key={`${bodyAfter?.length}-${bodyBefore.length}-${diffView}`}
        afterText={bodyAfter}
        beforeText={bodyBefore}
        diffStyle={diffView}
        essayId={essayId}
      />
    </ClientOnly>
  );
}

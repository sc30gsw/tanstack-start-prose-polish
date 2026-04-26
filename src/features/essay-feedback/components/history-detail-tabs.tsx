import { Group, Paper, SegmentedControl, Skeleton, Stack, Tabs, Text } from "@mantine/core";
import { ClientOnly, useNavigate } from "@tanstack/react-router";

import { DiffView } from "~/features/essay-feedback/components/diff-view";
import { ResultReader } from "~/features/essay-feedback/components/result-reader";
import { DIFF_VIEW_MODE_OPTIONS } from "~/features/essay-feedback/constants/diff-view-ui";
import { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import { useResolvedDiffView } from "~/features/essay-feedback/hooks/use-resolved-diff-view";
import type { DiffSearchParams } from "~/features/essay-feedback/schemas/search-params/essays-diff-search-params";

type HistoryDetailTabsProps = {
  bodyAfter?: null | string;
  bodyBefore: string;
  essayId: string;
  tab: "after" | "before" | "diff" | undefined;
  view: DiffSearchParams["view"] | undefined;
};

export function HistoryDetailTabs({
  bodyBefore,
  bodyAfter,
  essayId,
  tab: tabFromUrl,
  view: viewFromUrl,
}: HistoryDetailTabsProps) {
  const { isLoading } = useDiffComments(essayId);
  const navigate = useNavigate({ from: "/essays/$essayId/history" });
  const activeTab = tabFromUrl ?? "before";
  const diffView = useResolvedDiffView(viewFromUrl);

  const handleDiffViewChange = (value: string) => {
    void navigate({
      search: (prev) => ({ ...prev, view: value as "split" | "unified" }),
    });
  };

  const handleTabChange = (value: null | string) => {
    if (value == null) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: value as "after" | "before" | "diff",
      }),
    });
  };

  return (
    <Stack gap="lg">
      <Tabs
        onChange={handleTabChange}
        styles={{
          list: {
            justifyContent: "center",
            width: "100%",
          },
          tab: {
            fontSize: "var(--mantine-font-size-lg)",
            padding: "var(--mantine-spacing-sm) var(--mantine-spacing-lg)",
          },
        }}
        value={activeTab}
        variant="outline"
      >
        <Tabs.List>
          <Tabs.Tab value="before">添削前</Tabs.Tab>
          <Tabs.Tab disabled={bodyAfter == null} value="diff">
            前後比較
          </Tabs.Tab>
          <Tabs.Tab disabled={bodyAfter == null} value="after">
            添削後
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="before">
          <Paper mt="md" p="xl" radius="md" withBorder>
            <Text size="md" className="line-height-2 font-serif whitespace-pre-wrap">
              {bodyBefore}
            </Text>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="diff">
          {bodyAfter != null ? (
            <Stack gap="md" mt="md">
              <Group justify="center" w="100%" wrap="nowrap">
                <SegmentedControl
                  aria-label="見方を切り替え"
                  data={DIFF_VIEW_MODE_OPTIONS.map(({ label, value }) => ({ label, value }))}
                  fullWidth
                  maw={560}
                  onChange={handleDiffViewChange}
                  size="sm"
                  value={diffView}
                  w="100%"
                />
              </Group>
              {isLoading ? (
                <Skeleton aria-busy="true" aria-label="指摘を読み込み中" height={400} radius="md" />
              ) : (
                <ClientOnly
                  fallback={
                    <Skeleton
                      aria-busy="true"
                      aria-label="差分を読み込み中"
                      height={400}
                      radius="md"
                    />
                  }
                >
                  <DiffView
                    key={`${bodyAfter.length}-${bodyBefore.length}-${diffView}`}
                    afterText={bodyAfter}
                    beforeText={bodyBefore}
                    diffStyle={diffView}
                    essayId={essayId}
                  />
                </ClientOnly>
              )}
            </Stack>
          ) : (
            <Text c="dimmed" mt="md">
              添削後の文章がまだありません
            </Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="after">
          {bodyAfter != null ? (
            <ClientOnly>
              <Stack mt="md">
                <ResultReader correctedBody={bodyAfter} />
              </Stack>
            </ClientOnly>
          ) : (
            <Text c="dimmed" mt="md">
              添削後の文章がまだありません
            </Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

import { Group, Paper, SegmentedControl, Skeleton, Stack, Tabs, Text } from "@mantine/core";
import { ClientOnly, useNavigate } from "@tanstack/react-router";

import { DiffView } from "~/features/essay-feedback/components/diff-view";
import { ResultReader } from "~/features/essay-feedback/components/result-reader";
import {
  DIFF_VIEW_MODE_CONTROL_LABEL,
  DIFF_VIEW_MODE_OPTIONS,
} from "~/features/essay-feedback/constants/diff-view-ui";
import { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import { useResolvedDiffView } from "~/features/essay-feedback/hooks/use-resolved-diff-view";
import type { DiffComment } from "~/features/essay-feedback/schemas/essay-schema";

type HistoryDetailTabsProps = {
  bodyAfter?: null | string;
  bodyBefore: string;
  essayId: string;
  tab: "after" | "before" | "diff" | undefined;
  view: "split" | "unified" | undefined;
};

export function HistoryDetailTabs({
  bodyBefore,
  bodyAfter,
  essayId,
  tab: tabFromUrl,
  view: viewFromUrl,
}: HistoryDetailTabsProps) {
  const { addComment, comments, isLoading, removeUserComment, updateUserComment } =
    useDiffComments(essayId);
  const diffComments = (comments as unknown[]).map((c) => c as DiffComment);
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
    <Tabs onChange={handleTabChange} value={activeTab}>
      <Tabs.List mb="md">
        <Tabs.Tab aria-label="添削前タブ" value="before">
          添削前
        </Tabs.Tab>
        <Tabs.Tab aria-label="Diff 指摘タブ" disabled={bodyAfter == null} value="diff">
          Diff 指摘
        </Tabs.Tab>
        <Tabs.Tab aria-label="添削後タブ" disabled={bodyAfter == null} value="after">
          添削後
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="before">
        <Paper p="xl" radius="md" withBorder>
          <Text
            size="md"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 2,
              whiteSpace: "pre-wrap",
            }}
          >
            {bodyBefore}
          </Text>
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="diff">
        {bodyAfter != null ? (
          <Stack gap="md">
            <Group justify="flex-end">
              <SegmentedControl
                aria-label={DIFF_VIEW_MODE_CONTROL_LABEL}
                data={DIFF_VIEW_MODE_OPTIONS.map(({ label, value }) => ({ label, value }))}
                onChange={handleDiffViewChange}
                size="xs"
                value={diffView}
              />
            </Group>
            {isLoading ? (
              <Skeleton aria-busy="true" aria-label="指摘を読み込み中" height={400} radius="md" />
            ) : (
              <ClientOnly
                fallback={
                  <Skeleton
                    aria-busy="true"
                    aria-label="Diff を読み込み中"
                    height={400}
                    radius="md"
                  />
                }
              >
                <DiffView
                  key={`${bodyAfter.length}-${bodyBefore.length}-${diffView}`}
                  afterText={bodyAfter}
                  beforeText={bodyBefore}
                  comments={diffComments}
                  diffStyle={diffView}
                  onAddComment={addComment}
                  onDeleteUserComment={removeUserComment}
                  onUpdateUserComment={updateUserComment}
                  readonly
                  showAiModalCommentForm
                />
              </ClientOnly>
            )}
          </Stack>
        ) : (
          <Text c="dimmed">添削後の文章がまだありません</Text>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="after">
        {bodyAfter != null ? (
          <ClientOnly>
            <ResultReader correctedBody={bodyAfter} />
          </ClientOnly>
        ) : (
          <Text c="dimmed">添削後の文章がまだありません</Text>
        )}
      </Tabs.Panel>
    </Tabs>
  );
}

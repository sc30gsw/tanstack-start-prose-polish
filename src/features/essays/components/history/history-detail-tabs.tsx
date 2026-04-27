import { Container, Paper, Stack, Tabs, Text } from "@mantine/core";
import { ClientOnly, getRouteApi } from "@tanstack/react-router";

import { HistoryDetailDiffPanel } from "~/features/essays/components/history/hisotry-detail-diff-panel";
import { ResultReader } from "~/features/essays/components/result/result-reader";
import { useEssayDetail } from "~/features/essays/hooks/shared/use-essay-detail";
import type { EssayHistoriesSearchParams } from "~/features/essays/schemas/search-params/essay-histories-search-params";

const routeApi = getRouteApi("/_authenticated/essays/$essayId/history");

export function HistoryDetailTabs() {
  const { essayId } = routeApi.useParams();
  const { tab } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { essay, isLoading } = useEssayDetail(essayId);

  const activeTab = tab ?? "before";

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

  return (
    <Stack gap="lg">
      <Tabs
        onChange={(value) => {
          if (!value) {
            return;
          }

          navigate({
            search: (prev) => ({
              ...prev,
              tab: value as EssayHistoriesSearchParams["tab"],
            }),
          });
        }}
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
          <Tabs.Tab disabled={!essay.bodyAfter} value="diff">
            前後比較
          </Tabs.Tab>
          <Tabs.Tab disabled={!essay.bodyAfter} value="after">
            添削後
          </Tabs.Tab>
        </Tabs.List>

        <HistoryDetailBeforePanel bodyBefore={essay.bodyBefore} />
        <HistoryDetailDiffPanel bodyAfter={essay.bodyAfter} bodyBefore={essay.bodyBefore} />
        <HistoryDetailAfterPanel bodyAfter={essay.bodyAfter} essayId={essayId} />
      </Tabs>
    </Stack>
  );
}

function HistoryDetailBeforePanel({
  bodyBefore,
}: Pick<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>, "bodyBefore">) {
  return (
    <Tabs.Panel value="before">
      <Paper mt="md" p="xl" radius="md" withBorder>
        <Text className="line-height-2 font-serif whitespace-pre-wrap" size="md">
          {bodyBefore}
        </Text>
      </Paper>
    </Tabs.Panel>
  );
}

function HistoryDetailAfterPanel({
  bodyAfter,
  essayId,
}: Pick<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>, "bodyAfter"> &
  Record<"essayId", string>) {
  if (!bodyAfter) {
    return (
      <Tabs.Panel value="after">
        <Text c="dimmed" mt="md">
          添削後の文章がまだありません
        </Text>
      </Tabs.Panel>
    );
  }

  return (
    <Tabs.Panel value="after">
      <ClientOnly>
        <Stack mt="md">
          <ResultReader essayId={essayId} />
        </Stack>
      </ClientOnly>
    </Tabs.Panel>
  );
}

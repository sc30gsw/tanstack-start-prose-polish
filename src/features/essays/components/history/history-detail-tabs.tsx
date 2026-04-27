import { Container, Paper, Stack, Tabs, Text } from "@mantine/core";
import { ClientOnly, getRouteApi } from "@tanstack/react-router";

import { HistoryDetailDiffPanel } from "~/features/essays/components/history/hisotry-detail-diff-panel";
import { ResultReader } from "~/features/essays/components/result/result-reader";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";
import type { EssayHistoriesSearchParams } from "~/features/essays/schemas/search-params/essay-histories-search-params";
import type { EssayResultSearchParams } from "~/features/essays/schemas/search-params/essay-result-search-params";

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

        <HistoryDetailBeforeSentencePanel bodyBefore={essay.bodyBefore} />
        <HistoryDetailDiffPanel bodyAfter={essay.bodyAfter} bodyBefore={essay.bodyBefore} />
        <HistoryDetailResultReaderPanel bodyAfter={essay.bodyAfter} />
      </Tabs>
    </Stack>
  );
}

function HistoryDetailBeforeSentencePanel({
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

function HistoryDetailResultReaderPanel({
  bodyAfter,
}: Pick<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>, "bodyAfter">) {
  const { essayId } = routeApi.useParams();
  const { accent, mode } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handleModeChange = (mode: EssayResultSearchParams["mode"]) => {
    navigate({
      search: (prev) => ({ ...prev, mode }),
    });
  };

  const handleAccentChange = (accent: EssayResultSearchParams["accent"]) => {
    navigate({
      search: (prev) => ({ ...prev, accent }),
    });
  };

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
          <ResultReader
            essayId={essayId}
            accent={accent}
            onAccentChange={handleAccentChange}
            mode={mode}
            onModeChange={handleModeChange}
          />
        </Stack>
      </ClientOnly>
    </Tabs.Panel>
  );
}

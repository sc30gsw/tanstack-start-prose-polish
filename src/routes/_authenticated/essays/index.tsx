import { Button, Container, Group, Loader, Stack, Text, Title } from "@mantine/core";
import {
  ClientOnly,
  Link,
  createFileRoute,
  getRouteApi,
  stripSearchParams,
} from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { EssaySearch } from "~/features/essay-feedback/components/essay-search";
import { EssaysPagination } from "~/features/essay-feedback/components/essays-pagination";
import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import {
  ESSAY_LIST_PAGE_SIZE,
  useEssaysList,
} from "~/features/essay-feedback/hooks/use-essays-list";
import {
  defaultEssaysSearchParams,
  essaysSearchSchema,
} from "~/features/essay-feedback/schemas/search-params/essays-search-params";

export const Route = createFileRoute("/_authenticated/essays/")({
  component: EssaysPage,
  validateSearch: valibotValidator(essaysSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultEssaysSearchParams)],
  },
});

const routeApi = getRouteApi("/_authenticated/essays/");

function EssaysList() {
  const { q, mode: modeFilter, page } = routeApi.useSearch();

  const { error, essays, hasNextPage, isLoading } = useEssaysList({
    mode: modeFilter,
    page,
    q,
  });

  const hasFilter = q.trim() !== "" || modeFilter !== "all";
  const totalPages = hasNextPage ? page + 1 : Math.max(1, page);

  if (isLoading) {
    return (
      <Stack align="center" mt="xl">
        <Loader aria-label="履歴を読み込み中" />
      </Stack>
    );
  }

  if (error != null) {
    return (
      <Text c="red" mt="md">
        履歴の読み込みに失敗しました: {error.message}
      </Text>
    );
  }

  if (essays.length === 0) {
    if (!hasFilter) {
      return (
        <Stack align="center" gap="md" mt="xl">
          <Text c="dimmed" ta="center">
            まだ作文がありません
          </Text>
          <Button
            renderRoot={(props) => <Link to="/essays/new" {...props} />}
            size="sm"
            variant="light"
          >
            最初の作文を書く
          </Button>
        </Stack>
      );
    }

    return (
      <Stack align="center" gap="md" mt="xl">
        <Text c="dimmed" ta="center">
          検索・絞り込み条件に合う履歴はありません
        </Text>
      </Stack>
    );
  }

  const startCount = (page - 1) * ESSAY_LIST_PAGE_SIZE + 1;
  const endCount = startCount + essays.length - 1;

  return (
    <Stack gap="sm">
      <Text c="dimmed" size="sm">
        {startCount}〜{endCount}件
      </Text>
      {essays.map((essay) => (
        <HistoryCard key={essay.id} essay={essay} />
      ))}
      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <EssaysPagination totalPages={totalPages} />
        </Group>
      )}
    </Stack>
  );
}

function EssaysPage() {
  return (
    <Container py="xl" size="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>学習履歴</Title>
        <Button renderRoot={(props) => <Link to="/essays/new" {...props} />} size="md">
          新しい作文を始める
        </Button>
      </Group>

      <Stack gap="xs" mb="lg">
        <Text c="dimmed" size="sm">
          キーワードと作文モードで絞り込めます
        </Text>
        <EssaySearch />
      </Stack>

      <ClientOnly>
        <EssaysList />
      </ClientOnly>
    </Container>
  );
}

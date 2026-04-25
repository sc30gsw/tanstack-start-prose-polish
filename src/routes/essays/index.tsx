import {
  Button,
  Container,
  Grid,
  GridCol,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import { useEssayHistory } from "~/features/essay-feedback/hooks/use-essay-history";

const MODE_FILTER_OPTIONS = [
  { label: "すべて", value: "all" },
  { label: "自由作文", value: "free" },
  { label: "トピック選択", value: "topic" },
  { label: "多様なお題", value: "diverse" },
] as const;

type ModeFilter = (typeof MODE_FILTER_OPTIONS)[number]["value"];

export const Route = createFileRoute("/essays/")({
  component: EssaysPage,
});

const ITEMS_PER_PAGE = 10;

function deriveSearchText(mode: string, bodyBefore: string, prompt?: null | string): string {
  if (
    (mode === "topic" || mode === "diverse" || mode === "philosophy") &&
    prompt != null &&
    prompt.trim().length > 0
  ) {
    return prompt;
  }
  return bodyBefore;
}

function matchesModeFilter(mode: string, modeFilter: ModeFilter): boolean {
  if (modeFilter === "all") {
    return true;
  }
  if (modeFilter === "diverse") {
    return mode === "diverse" || mode === "philosophy";
  }
  return mode === modeFilter;
}

type EssaysListProps = {
  debouncedQuery: string;
  modeFilter: ModeFilter;
  onPageChange: (page: number) => void;
  page: number;
};

function EssaysList({ debouncedQuery, modeFilter, onPageChange, page }: EssaysListProps) {
  const { essays, isLoading, error } = useEssayHistory();

  const filtered = essays.filter((essay) => {
    if (!matchesModeFilter(essay.mode, modeFilter)) {
      return false;
    }
    if (debouncedQuery.trim() === "") {
      return true;
    }
    const text = deriveSearchText(
      essay.mode,
      essay.bodyBefore as string,
      essay.prompt as string | null | undefined,
    );
    return text.toLowerCase().includes(debouncedQuery.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        履歴の読み込みに失敗しました: {(error as Error).message}
      </Text>
    );
  }

  if (filtered.length === 0) {
    const hasNoEssays = essays.length === 0;

    if (hasNoEssays) {
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

  const narrowLabel = debouncedQuery.trim() !== "" || modeFilter !== "all" ? " (絞り込み)" : "";

  return (
    <Stack gap="sm">
      <Text c="dimmed" size="sm">
        {filtered.length} 件{narrowLabel}
      </Text>
      {paged.map((essay) => (
        <HistoryCard key={essay.id} essay={essay} />
      ))}
      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination
            onChange={(p) => {
              onPageChange(p);
              window.scrollTo({ behavior: "smooth", top: 0 });
            }}
            total={totalPages}
            value={currentPage}
          />
        </Group>
      )}
    </Stack>
  );
}

function EssaysPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [page, setPage] = useState(1);
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

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
        <Grid align="flex-end" gap="md" w="100%">
          <GridCol span={{ base: 12, md: 8 }}>
            <TextInput
              aria-label="履歴をキーワード検索"
              leftSection={<IconSearch size={18} />}
              onChange={(e) => handleQueryChange(e.currentTarget.value)}
              placeholder="タイトル・本文の内容で検索"
              size="md"
              value={query}
              w="100%"
            />
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <Select
              aria-label="作文モードで絞り込み"
              data={[...MODE_FILTER_OPTIONS]}
              leftSection={<IconFilter size={18} />}
              maw={{ base: "100%", md: 320 }}
              miw={{ base: 0, md: 200 }}
              onChange={(v) => {
                setModeFilter((v ?? "all") as ModeFilter);
                setPage(1);
              }}
              placeholder="モードを選択"
              size="md"
              value={modeFilter}
              w="100%"
            />
          </GridCol>
        </Grid>
      </Stack>

      <ClientOnly>
        <EssaysList
          debouncedQuery={debouncedQuery}
          modeFilter={modeFilter}
          onPageChange={setPage}
          page={page}
        />
      </ClientOnly>
    </Container>
  );
}

import {
  Button,
  Container,
  Group,
  Loader,
  Pagination,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import { useEssayHistory } from "~/features/essay-feedback/hooks/use-essay-history";
import { db } from "~/lib/instant";

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

type EssaysListProps = {
  debouncedQuery: string;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  page: number;
};

function EssaysList({ debouncedQuery, onDelete, onPageChange, page }: EssaysListProps) {
  const { essays, isLoading, error } = useEssayHistory();

  const filtered = essays.filter((essay) => {
    if (debouncedQuery.trim() === "") return true;
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
    return (
      <Stack align="center" gap="md" mt="xl">
        <Text c="dimmed" ta="center">
          {debouncedQuery ? "検索結果がありません" : "まだ作文がありません"}
        </Text>
        {!debouncedQuery && (
          <Button
            renderRoot={(props) => <Link to="/essays/new" {...props} />}
            size="sm"
            variant="light"
          >
            最初の作文を書く
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Text c="dimmed" size="sm">
        {filtered.length} 件{debouncedQuery && " (検索結果)"}
      </Text>
      {paged.map((essay) => (
        <HistoryCard
          key={essay.id}
          bodyBefore={essay.bodyBefore as string}
          cefr={essay.cefr}
          createdAt={new Date(essay.createdAt as string | number | Date)}
          id={essay.id}
          mode={essay.mode}
          onDelete={(id) => onDelete(id)}
          prompt={essay.prompt as string | null | undefined}
          score={essay.score}
          status={essay.status}
          toeicMax={essay.toeicMax}
          toeicMin={essay.toeicMin}
        />
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

  const handleDelete = async (id: string) => {
    const tx = db.tx.essays[id];
    if (tx == null) return;
    await db.transact(tx.delete());
  };

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

      <TextInput
        aria-label="履歴を検索"
        leftSection={<IconSearch size={16} />}
        mb="lg"
        onChange={(e) => handleQueryChange(e.currentTarget.value)}
        placeholder="タイトル・内容で検索..."
        size="md"
        value={query}
      />

      <ClientOnly>
        <EssaysList
          debouncedQuery={debouncedQuery}
          onDelete={(id) => void handleDelete(id)}
          onPageChange={setPage}
          page={page}
        />
      </ClientOnly>
    </Container>
  );
}

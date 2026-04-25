import { Button, Loader, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import { useRecentEssays } from "~/features/essay-feedback/hooks/use-recent-essays";

export function HistoryList() {
  const { essays, isLoading, error } = useRecentEssays();

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
    return (
      <Stack align="center" gap="md" mt="lg">
        <Text c="dimmed" ta="center">
          まだ作文がありません。最初の作文を書いてみましょう。
        </Text>
        <Button
          renderRoot={(props) => <Link to="/essays/new" {...props} />}
          size="sm"
          variant="light"
        >
          新しい作文を書く
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      {essays.map((essay) => (
        <HistoryCard key={essay.id} essay={essay} />
      ))}
    </Stack>
  );
}

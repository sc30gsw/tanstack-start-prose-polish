import { Anchor, Button, Loader, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import { useRecentEssays } from "~/features/essay-feedback/hooks/use-recent-essays";

const HOME_RECENT_LIMIT = 5;

export function HomeRecentHistory() {
  const { essays, isLoading, error } = useRecentEssays();
  const recent = essays.slice(0, HOME_RECENT_LIMIT);
  const restCount = Math.max(0, essays.length - HOME_RECENT_LIMIT);

  if (isLoading) {
    return (
      <Stack align="center" py="lg">
        <Loader aria-label="履歴を読み込み中" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Text c="red" size="sm">
        履歴の読み込みに失敗しました: {error.message}
      </Text>
    );
  }

  if (essays.length === 0) {
    return (
      <Stack align="center" gap="md" py="md">
        <Text c="dimmed" size="sm" ta="center">
          まだ作文がありません。まずは英文を書いてみましょう。
        </Text>
        <Button renderRoot={(props) => <Link to="/essays/new" {...props} />} size="md">
          新しい作文を始める
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      {recent.map((essay) => (
        <HistoryCard key={essay.id} essay={essay} />
      ))}
      {restCount > 0 && (
        <Text c="dimmed" mt="xs" size="sm" ta="center">
          ほか {restCount} 件は
          <Anchor c="indigo" component={Link} fw={500} ml={4} to="/essays" underline="hover">
            履歴一覧
          </Anchor>
          で確認できます。
        </Text>
      )}
    </Stack>
  );
}

import { Anchor, Button, Loader, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import { useEssayHistory } from "~/features/essay-feedback/hooks/use-essay-history";
import { db } from "~/lib/instant";

const HOME_RECENT_LIMIT = 5;

export function HomeRecentHistory() {
  const { essays, isLoading, error } = useEssayHistory();
  const recent = essays.slice(0, HOME_RECENT_LIMIT);
  const restCount = Math.max(0, essays.length - HOME_RECENT_LIMIT);

  const handleDelete = async (id: string) => {
    const tx = db.tx.essays[id];
    if (tx == null) return;
    await db.transact(tx.delete());
  };

  if (isLoading) {
    return (
      <Stack align="center" py="lg">
        <Loader aria-label="履歴を読み込み中" />
      </Stack>
    );
  }

  if (error != null) {
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
        <HistoryCard
          key={essay.id}
          bodyBefore={essay.bodyBefore as string}
          cefr={essay.cefr}
          createdAt={new Date(essay.createdAt as string | number | Date)}
          id={essay.id}
          mode={essay.mode}
          onDelete={(id) => void handleDelete(id)}
          prompt={essay.prompt as string | null | undefined}
          score={essay.score}
          status={essay.status}
          toeicMax={essay.toeicMax}
          toeicMin={essay.toeicMin}
        />
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

import { Card, Group, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconPencilPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { HistoryCard } from "~/features/essay-feedback/components/history-card";
import { useEssayHistory } from "~/features/essay-feedback/hooks/use-essay-history";
import { db } from "~/lib/instant";

export function HistoryList() {
  const { essays, isLoading, error } = useEssayHistory();

  const handleDelete = async (id: string) => {
    const tx = db.tx.essays[id];
    if (tx == null) return;
    await db.transact(tx.delete());
  };

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

  return (
    <Stack gap="md">
      <Card
        component={Link}
        padding="lg"
        radius="md"
        style={{ cursor: "pointer", textDecoration: "none" }}
        to="/essays/new"
        withBorder
      >
        <Group gap="md">
          <ThemeIcon color="blue" radius="md" size="xl" variant="light">
            <IconPencilPlus size={24} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={600} size="md">
              新しい作文を始める
            </Text>
            <Text c="dimmed" size="sm">
              英文を入力して AI に添削・採点してもらいましょう
            </Text>
          </Stack>
        </Group>
      </Card>

      {essays.length === 0 ? (
        <Text c="dimmed" mt="lg" ta="center">
          まだ作文がありません。最初の作文を書いてみましょう。
        </Text>
      ) : (
        <Stack gap="sm">
          {essays.map((essay) => (
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
        </Stack>
      )}
    </Stack>
  );
}

import { Container, Stack, Text, Title } from "@mantine/core";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { HistoryList } from "~/features/essay-feedback/components/history-list";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <Container py="xl" size="md">
      <Stack gap="xs" mb="xl">
        <Title order={1}>英語作文添削アプリ</Title>
        <Text c="dimmed" size="sm">
          英文を書いて AI に添削・採点してもらいましょう
        </Text>
      </Stack>
      <ClientOnly>
        <HistoryList />
      </ClientOnly>
    </Container>
  );
}

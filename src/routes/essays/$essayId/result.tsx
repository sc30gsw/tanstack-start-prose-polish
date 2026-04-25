import { Button, Container, Group, Stack, Text } from "@mantine/core";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageHeader } from "~/components/page-header";
import { ResultReader } from "~/features/essay-feedback/components/result-reader";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";

export const Route = createFileRoute("/essays/$essayId/result")({
  component: ResultPage,
});

function ResultPage() {
  const { essayId } = Route.useParams();
  const navigate = useNavigate({ from: "/essays/$essayId/result" });
  const { essay, isLoading } = useEssayDetail(essayId);

  if (isLoading) {
    return (
      <Container py="xl" size="md">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  const essayData = essay as {
    bodyAfter?: null | string;
    bodyBefore?: string;
  } | null;

  if (essayData == null || essayData.bodyBefore == null) {
    return (
      <Container py="xl" size="md">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  if (essayData.bodyAfter == null) {
    return (
      <Container py="xl" size="md">
        <Text c="dimmed">添削中です。しばらくお待ちください...</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="md">
      <PageHeader backHref="/" backLabel="履歴一覧" title="添削後の文章" />
      <Stack gap="lg">
        <Group gap="sm">
          <Button
            onClick={() => {
              // @ts-expect-error TanStack Start augments @tanstack/react-start.Register but useNavigate reads @tanstack/router-core.Register; navigate works at runtime
              void navigate({ params: { essayId }, to: "/essays/$essayId/diff" });
            }}
            size="sm"
            variant="light"
          >
            ← Diff を確認する
          </Button>
          <Button
            onClick={() => {
              // @ts-expect-error TanStack Start augments @tanstack/react-start.Register but useNavigate reads @tanstack/router-core.Register; navigate works at runtime
              void navigate({ params: { essayId }, to: "/essays/$essayId/history" });
            }}
            size="sm"
            variant="light"
          >
            履歴詳細を見る
          </Button>
        </Group>
        <ClientOnly>
          <ResultReader correctedBody={essayData.bodyAfter} />
        </ClientOnly>
      </Stack>
    </Container>
  );
}

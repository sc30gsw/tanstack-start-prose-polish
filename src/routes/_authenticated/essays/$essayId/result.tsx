import { Button, Container, Stack, Text } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "~/components/page-header";
import { ResultReader } from "~/features/essay-feedback/components/result-reader";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";

export const Route = createFileRoute("/_authenticated/essays/$essayId/result")({
  component: ResultPage,
});

function ResultPage() {
  const { essayId } = Route.useParams();
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
      <Stack gap="xl">
        <PageHeader
          backLink={
            <Link to="/essays/$essayId/diff" params={{ essayId }}>
              前後の文章を比較
            </Link>
          }
          title="添削後の文章"
        >
          <Button
            leftSection={<IconListDetails size={18} stroke={1.75} />}
            size="sm"
            variant="filled"
            renderRoot={(props) => (
              <Link to="/essays/$essayId/history" params={{ essayId }} {...props} />
            )}
          >
            履歴の詳細
          </Button>
        </PageHeader>
        <ClientOnly>
          <ResultReader correctedBody={essayData.bodyAfter} />
        </ClientOnly>
      </Stack>
    </Container>
  );
}

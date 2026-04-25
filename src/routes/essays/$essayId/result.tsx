import { Button, Container, Stack, Text } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
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
      <Stack gap="xl">
        <PageHeader
          backHref={`/essays/${essayId}/diff`}
          backLabel="前後の文章を比較"
          endSection={
            <Button
              leftSection={<IconListDetails size={18} stroke={1.75} />}
              onClick={() => {
                // @ts-expect-error TanStack Start route register vs router-core navigate types
                void navigate({ params: { essayId }, to: "/essays/$essayId/history" });
              }}
              size="sm"
              variant="filled"
            >
              履歴の詳細
            </Button>
          }
          title="添削後の文章"
        />
        <ClientOnly>
          <ResultReader correctedBody={essayData.bodyAfter} />
        </ClientOnly>
      </Stack>
    </Container>
  );
}

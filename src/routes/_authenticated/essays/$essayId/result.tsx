import { Button, Container, Stack } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "~/components/page-header";
import { ResultReader } from "~/features/essays/components/result-reader";

export const Route = createFileRoute("/_authenticated/essays/$essayId/result")({
  component: ResultPage,
});

function ResultPage() {
  const { essayId } = Route.useParams();

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
          <ResultReader essayId={essayId} />
        </ClientOnly>
      </Stack>
    </Container>
  );
}

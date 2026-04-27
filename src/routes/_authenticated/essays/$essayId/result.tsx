import { Button, Container, Stack } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
import { ClientOnly, createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { PageHeader } from "~/components/page-header";
import { ResultReader } from "~/features/essays/components/result/result-reader";
import {
  defaultEssayResultSearchParams,
  essayResultSearchSchema,
  type EssayResultSearchParams,
} from "~/features/essays/schemas/search-params/essay-result-search-params";

export const Route = createFileRoute("/_authenticated/essays/$essayId/result")({
  component: ResultPage,
  validateSearch: valibotValidator(essayResultSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultEssayResultSearchParams)],
  },
});

function ResultPage() {
  const { essayId } = Route.useParams();
  const { accent, mode } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleModeChange = (mode: EssayResultSearchParams["mode"]) => {
    navigate({
      params: { essayId },
      search: (prev) => ({ ...prev, mode }),
    });
  };

  const handleAccentChange = (accent: EssayResultSearchParams["accent"]) => {
    navigate({
      params: { essayId },
      search: (prev) => ({ ...prev, accent }),
    });
  };

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
          <ResultReader
            essayId={essayId}
            accent={accent}
            onAccentChange={handleAccentChange}
            mode={mode}
            onModeChange={handleModeChange}
          />
        </ClientOnly>
      </Stack>
    </Container>
  );
}

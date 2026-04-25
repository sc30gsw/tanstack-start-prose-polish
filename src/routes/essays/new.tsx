import { Container } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { PageHeader } from "~/components/page-header";
import { EssayNewForm } from "~/features/essay-feedback/components/essay-new-form";
import {
  defaultEssaysNewSearchParams,
  essaysNewSearchSchema,
} from "~/features/essay-feedback/schemas/search-params/essays-search-params";

export const Route = createFileRoute("/essays/new")({
  component: EssayNewPage,
  validateSearch: valibotValidator(essaysNewSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultEssaysNewSearchParams)],
  },
});

function EssayNewPage() {
  return (
    <Container py="xl" size="md">
      <PageHeader backHref="/" backLabel="履歴一覧" title="新しい作文を始める" />
      <EssayNewForm />
    </Container>
  );
}

import { Pagination } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";

import type { EssaysSearchParams } from "~/features/essay-feedback/schemas/search-params/essays-search-params";

const routeApi = getRouteApi("/_authenticated/essays/");

export function EssaysPagination({ totalPages }: Record<"totalPages", number>) {
  const { page } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const goToPage = (next: EssaysSearchParams["page"]) => {
    navigate({ replace: true, search: (prev) => ({ ...prev, page: next }) });
  };

  return (
    <Pagination
      onChange={(p) => {
        goToPage(p);
        window.scrollTo({ behavior: "smooth", top: 0 });
      }}
      total={totalPages}
      value={page}
    />
  );
}

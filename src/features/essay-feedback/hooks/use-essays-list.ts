import type {
  EssaysModeFilter,
  EssaysSearchParams,
} from "~/features/essay-feedback/schemas/search-params/essays-search-params";
import { db } from "~/lib/instant";

const ESSAYS_ORDER_DESC = { order: { createdAt: "desc" as const } };
export const ESSAY_LIST_PAGE_SIZE = 10;

function escapeIlikeUserInput(input: EssaysSearchParams["q"]) {
  return input.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function buildEssaysListWhere(mode: EssaysModeFilter, q: EssaysSearchParams["q"]) {
  const parts: Record<string, unknown>[] = [];

  if (mode === "free" || mode === "topic") {
    parts.push({ mode });
  } else if (mode === "diverse") {
    parts.push({ mode: "diverse" });
  }

  const trimmed = q.trim();

  if (trimmed.length > 0) {
    const p = `%${escapeIlikeUserInput(trimmed)}%`;

    parts.push({
      or: [{ bodyBefore: { $ilike: p } }, { bodyAfter: { $ilike: p } }, { prompt: { $ilike: p } }],
    });
  }

  if (parts.length === 0) {
    return undefined;
  }

  if (parts.length === 1) {
    return parts[0]!;
  }

  return { and: parts };
}

export function useEssaysList(search: EssaysSearchParams) {
  const where = buildEssaysListWhere(search.mode ?? "all", search.q ?? "");

  const page$ = {
    ...ESSAYS_ORDER_DESC,
    limit: ESSAY_LIST_PAGE_SIZE,
    offset: (search.page - 1) * ESSAY_LIST_PAGE_SIZE,
  };

  const { data, error, isLoading, pageInfo } = db.useQuery(
    where ? { essays: { $: page$ } } : { essays: { $: { ...page$, where: where } } },
  );

  return {
    error: error,
    essays: data?.essays ?? [],
    hasNextPage: pageInfo?.essays?.hasNextPage ?? false,
    isLoading,
  };
}

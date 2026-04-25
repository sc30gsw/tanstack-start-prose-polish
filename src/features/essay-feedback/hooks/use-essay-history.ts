import type {
  EssaysModeFilter,
  EssaysSearchParams,
} from "~/features/essay-feedback/schemas/search-params/essays-search-params";
import { db } from "~/lib/instant";

export const ESSAY_LIST_PAGE_SIZE = 10;

const orderDesc = { order: { createdAt: "desc" as const } };

function escapeIlikeUserInput(input: string) {
  return input.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function buildEssaysListWhere(mode: EssaysModeFilter, q: string) {
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

function essaysQuery(query: EssaysSearchParams | undefined) {
  if (!query) {
    return { essays: { $: orderDesc } };
  }

  const where = buildEssaysListWhere(query.mode ?? "all", query.q ?? "");

  return {
    essays: {
      $: {
        ...orderDesc,
        limit: ESSAY_LIST_PAGE_SIZE,
        offset: (query.page - 1) * ESSAY_LIST_PAGE_SIZE,
        ...(where ? { where } : {}),
      },
    },
  };
}

export function useEssayHistory(query?: EssaysSearchParams) {
  const { data, error, isLoading, pageInfo } = db.useQuery(essaysQuery(query));

  return {
    error: error,
    essays: data?.essays ?? [],
    hasNextPage: query != null && (pageInfo?.essays?.hasNextPage ?? false),
    isLoading,
  };
}

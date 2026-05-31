import type { InstaQLEntity } from "@instantdb/react";
import { useMemo } from "react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { ESSAY_SEARCH_SCAN_LIMIT } from "~/features/essays/constants/essay";
import type {
  EssaysModeFilter,
  EssaysSearchParams,
} from "~/features/essays/schemas/search-params/essays-search-params";

const ESSAYS_ORDER_DESC = { order: { createdAt: "desc" } } as const;
export const ESSAY_LIST_PAGE_SIZE = 10;

type EssayListRow = InstaQLEntity<AppSchema, "essays", { scoring: {} }>;

function buildModeWhere(mode: EssaysModeFilter) {
  if (mode === "free" || mode === "topic" || mode === "diverse") {
    return { mode } as const;
  }

  return undefined;
}

//? bodyBefore / bodyAfter / prompt は indexed 不可（最大 10,000 文字）のためクライアント側で全文検索（最大 ESSAY_SEARCH_SCAN_LIMIT 件）
function essayMatchesQuery(essay: EssayListRow, needleLower: string) {
  if (needleLower.length === 0) {
    return true;
  }

  return [essay.bodyBefore, essay.bodyAfter, essay.prompt].some(
    (part) => typeof part === "string" && part.toLowerCase().includes(needleLower),
  );
}

export function useEssaysList(search: EssaysSearchParams) {
  const trimmedQ = (search.q ?? "").trim();
  const hasTextSearch = trimmedQ.length > 0;
  const modeWhere = buildModeWhere(search.mode ?? "all");

  const listQuery = useMemo(() => {
    const page$ = {
      ...ESSAYS_ORDER_DESC,
      limit: hasTextSearch ? ESSAY_SEARCH_SCAN_LIMIT : ESSAY_LIST_PAGE_SIZE,
      offset: hasTextSearch ? 0 : (search.page - 1) * ESSAY_LIST_PAGE_SIZE,
      ...(modeWhere ? { where: modeWhere } : {}),
    };

    return { essays: { $: page$, scoring: {} } };
  }, [hasTextSearch, modeWhere, search.page]);

  const { data, error, isLoading, pageInfo } = db.useQuery(listQuery);

  const { essays, hasNextPage, isTruncated } = useMemo(() => {
    const rows = (data?.essays ?? []) as EssayListRow[];

    if (!hasTextSearch) {
      return {
        essays: rows,
        hasNextPage: pageInfo?.essays?.hasNextPage ?? false,
        isTruncated: false,
      };
    }

    const needleLower = trimmedQ.toLowerCase();
    const filtered = rows.filter((essay) => essayMatchesQuery(essay, needleLower));
    const start = (search.page - 1) * ESSAY_LIST_PAGE_SIZE;

    return {
      essays: filtered.slice(start, start + ESSAY_LIST_PAGE_SIZE),
      hasNextPage: filtered.length > start + ESSAY_LIST_PAGE_SIZE,
      //? 走査上限に達した = 全文検索が古い履歴を取りこぼしている可能性
      isTruncated: rows.length >= ESSAY_SEARCH_SCAN_LIMIT,
    };
  }, [data?.essays, hasTextSearch, pageInfo?.essays?.hasNextPage, search.page, trimmedQ]);

  return {
    error,
    essays,
    hasNextPage,
    isLoading,
    isTruncated,
  } as const;
}

import type { InstaQLEntity } from "@instantdb/react";

import { db } from "~/lib/instant";
import type { AppSchema } from "~/lib/instant-schema";

export function useEssayDetail(essayId: InstaQLEntity<AppSchema, "essays">["id"]) {
  const { data, error, isLoading } = db.useQuery({
    essays: {
      $: { where: { id: essayId } },
      comments: {},
    },
  });

  const essay = data?.essays?.[0] ?? null;

  return {
    comments: essay?.comments ?? [],
    error: error,
    essay,
    isLoading,
  } as const;
}

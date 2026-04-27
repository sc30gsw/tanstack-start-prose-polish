import type { InstaQLEntity } from "@instantdb/react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";

export function useEssayDetail(essayId: InstaQLEntity<AppSchema, "essays">["id"]) {
  const { data, error, isLoading } = db.useQuery({
    essays: {
      $: { where: { id: essayId } },
      comments: {},
      scoring: {},
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

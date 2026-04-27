import { db } from "~/db/instant";

export function useRecentEssays() {
  const { data, error, isLoading } = db.useQuery({
    essays: { $: { order: { createdAt: "desc" as const } } },
  });

  return {
    error: error,
    essays: data?.essays ?? [],
    isLoading,
  } as const;
}

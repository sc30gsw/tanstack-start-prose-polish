import { db } from "~/lib/instant";

export function useEssayHistory() {
  const { data, error, isLoading } = db.useQuery({
    essays: {
      $: { order: { serverCreatedAt: "desc" } },
    },
  });

  return {
    error,
    essays: data?.essays ?? [],
    isLoading,
  };
}

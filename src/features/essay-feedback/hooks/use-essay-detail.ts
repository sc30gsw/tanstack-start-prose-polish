import { db } from "~/lib/instant";

export function useEssayDetail(essayId: string) {
  const { data, error, isLoading } = db.useQuery({
    essays: {
      $: { where: { id: essayId } },
      comments: {},
    },
  });

  const essay = data?.essays?.[0] ?? null;

  return {
    comments: essay?.comments ?? [],
    error: error as Error | null,
    essay,
    isLoading,
  };
}

import { useMediaQuery } from "@mantine/hooks";

import type { DiffSearchParams } from "~/routes/essays/$essayId/diff";

const NARROW_MAX = "(max-width: 47.99em)";

export function useResolvedDiffView(viewSearchParam: DiffSearchParams["view"] | undefined) {
  const isNarrow = useMediaQuery(NARROW_MAX, false, { getInitialValueInEffect: false });

  if (viewSearchParam) {
    return viewSearchParam;
  }

  if (isNarrow) {
    return "unified";
  }

  return "split";
}

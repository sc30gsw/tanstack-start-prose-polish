import { useMediaQuery } from "@mantine/hooks";

import type { DIFF_VIEW_MODE_OPTIONS } from "~/features/essay-feedback/constants/diff-view-ui";

const NARROW_MAX = "(max-width: 47.99em)";

export function useResolvedDiffView(
  viewFromUrl: (typeof DIFF_VIEW_MODE_OPTIONS)[number]["value"] | undefined,
) {
  const isNarrow = useMediaQuery(NARROW_MAX, false, { getInitialValueInEffect: false });

  if (viewFromUrl) {
    return viewFromUrl;
  }

  if (isNarrow) {
    return "unified";
  }

  return "split";
}

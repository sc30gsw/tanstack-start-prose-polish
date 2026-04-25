import { useMediaQuery } from "@mantine/hooks";

/** 狭い幅（sm 未満）では URL 未指定時に全体表示を既定にする。明示的な view はそのまま。 */
const NARROW_MAX = "(max-width: 47.99em)";

export function useResolvedDiffView(
  viewFromUrl: "split" | "unified" | undefined,
): "split" | "unified" {
  const isNarrow = useMediaQuery(NARROW_MAX, false, { getInitialValueInEffect: false });
  if (viewFromUrl != null) {
    return viewFromUrl;
  }
  if (isNarrow) {
    return "unified";
  }
  return "split";
}

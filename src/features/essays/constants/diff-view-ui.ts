export const DIFF_VIEW_MODE_OPTIONS = [
  { label: "左右表示", value: "split" },
  { label: "全体表示", value: "unified" },
] as const satisfies readonly Record<string, string>[];

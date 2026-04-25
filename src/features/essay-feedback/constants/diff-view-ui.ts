/** 添削結果（差分）画面の表示切り替え — 履歴の「添削前／添削後」と同じ語感 */
export const DIFF_VIEW_MODE_CONTROL_LABEL = "見方を切り替え";

export const DIFF_VIEW_MODE_OPTIONS = [
  { label: "左右表示", value: "split" as const },
  { label: "全体表示", value: "unified" as const },
] as const;

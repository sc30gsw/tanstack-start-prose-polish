import * as v from "valibot";

import { ACCENT_OPTIONS, MODE_OPTIONS } from "~/features/essays/constants/result-reader";

export const defaultEssayResultSearchParams = {
  accent: "american-female",
  mode: "aloud",
} as const satisfies Record<
  string,
  (typeof ACCENT_OPTIONS)[number]["value"] | (typeof MODE_OPTIONS)[number]["value"]
>;

export const essayResultSearchSchema = v.object({
  accent: v.optional(
    v.picklist(ACCENT_OPTIONS.map((a) => a.value)),
    defaultEssayResultSearchParams.accent,
  ),
  mode: v.optional(
    v.picklist(MODE_OPTIONS.map((m) => m.value)),
    defaultEssayResultSearchParams.mode,
  ),
});

export type EssayResultSearchParams = v.InferOutput<typeof essayResultSearchSchema>;

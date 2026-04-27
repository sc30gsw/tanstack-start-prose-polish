import * as v from "valibot";

import { DIFF_VIEW_MODE_OPTIONS } from "~/features/essays/constants/diff-view-ui";

export const defaultEssayHistoriesSearchParams = {
  tab: "before",
  view: "split",
} as const satisfies Record<string, string>;

export const essayHistoriesSearchSchema = v.object({
  tab: v.optional(v.picklist(["before", "diff", "after"]), defaultEssayHistoriesSearchParams.tab),
  view: v.optional(v.picklist(DIFF_VIEW_MODE_OPTIONS.map(({ value }) => value))),
});

export type EssayHistoriesSearchParams = v.InferOutput<typeof essayHistoriesSearchSchema>;

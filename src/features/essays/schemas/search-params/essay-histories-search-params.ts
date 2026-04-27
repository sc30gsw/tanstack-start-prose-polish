import * as v from "valibot";

import { DIFF_VIEW_MODE_OPTIONS } from "~/features/essays/constants/diff-view-ui";
import {
  defaultEssayResultSearchParams,
  essayResultSearchSchema,
} from "~/features/essays/schemas/search-params/essay-result-search-params";

export const defaultEssayHistoriesSearchParams = {
  tab: "before",
  view: "split",
  ...defaultEssayResultSearchParams,
} as const satisfies Record<
  string,
  (typeof defaultEssayResultSearchParams)[keyof typeof defaultEssayResultSearchParams] | string
>;

export const essayHistoriesSearchSchema = v.object({
  tab: v.optional(v.picklist(["before", "diff", "after"]), defaultEssayHistoriesSearchParams.tab),
  view: v.optional(v.picklist(DIFF_VIEW_MODE_OPTIONS.map(({ value }) => value))),
  ...essayResultSearchSchema.entries,
});

export type EssayHistoriesSearchParams = v.InferOutput<typeof essayHistoriesSearchSchema>;

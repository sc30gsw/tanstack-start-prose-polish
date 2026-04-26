import * as v from "valibot";

import { DIFF_VIEW_MODE_OPTIONS } from "~/features/essay-feedback/constants/diff-view-ui";

export const defaultDiffSearchParams = {
  view: "split",
} as const satisfies Record<string, (typeof DIFF_VIEW_MODE_OPTIONS)[number]["value"]>;

export const diffSearchSchema = v.object({
  view: v.optional(
    v.picklist(DIFF_VIEW_MODE_OPTIONS.map(({ value }) => value)),
    defaultDiffSearchParams.view,
  ),
});

export type DiffSearchParams = v.InferOutput<typeof diffSearchSchema>;

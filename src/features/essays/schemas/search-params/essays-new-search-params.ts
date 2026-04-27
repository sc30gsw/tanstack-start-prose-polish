import * as v from "valibot";

import {
  essaysFormModeSchema,
  type EssaysModeFilter,
} from "~/features/essays/schemas/search-params/essays-search-params";

export const defaultEssaysNewSearchParams = {
  mode: "free",
} as const satisfies Record<string, EssaysModeFilter>;

export const essaysNewSearchSchema = v.object({
  mode: v.optional(essaysFormModeSchema, defaultEssaysNewSearchParams.mode),
});

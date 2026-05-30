import * as v from "valibot";

import { ESSAY_MODE } from "~/features/essays/constants/essay";

export const essaysFormModeSchema = v.picklist(ESSAY_MODE);

const essaysModeSchema = v.union([v.literal("all"), essaysFormModeSchema]);

export const defaultEssaysSearchParams = {
  q: "",
  mode: "all",
  page: 1,
} as const satisfies { q: string; mode: EssaysModeFilter; page: number };

export const essaysSearchSchema = v.object({
  mode: v.optional(essaysModeSchema, defaultEssaysSearchParams.mode),
  q: v.optional(v.string(), defaultEssaysSearchParams.q),
  page: v.optional(v.number(), defaultEssaysSearchParams.page),
});

export type EssaysModeFilter = v.InferOutput<typeof essaysModeSchema>;
export type EssaysSearchParams = v.InferOutput<typeof essaysSearchSchema>;

import * as v from "valibot";

import { ESSAY_MODE } from "~/features/essay-feedback/constants/essay";

const essaysFormModeSchema = v.picklist(ESSAY_MODE);

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

export const defaultEssaysNewSearchParams = {
  mode: "free",
} as const satisfies Record<string, EssaysModeFilter>;

export const essaysNewSearchSchema = v.object({
  mode: v.optional(essaysFormModeSchema, defaultEssaysNewSearchParams.mode),
});

export type EssaysFormMode = v.InferOutput<typeof essaysFormModeSchema>;
export type EssaysModeFilter = v.InferOutput<typeof essaysModeSchema>;
export type EssaysNewSearchParams = v.InferOutput<typeof essaysNewSearchSchema>;
export type EssaysSearchParams = v.InferOutput<typeof essaysSearchSchema>;

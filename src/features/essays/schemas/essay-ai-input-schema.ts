import * as v from "valibot";

import { MAX_ESSAY_BODY_CHARS, MAX_ESSAY_PROMPT_CHARS } from "~/features/essays/constants/essay";
import { scoreSchema } from "~/features/essays/schemas/essay-schema";

const essayModeInputSchema = v.optional(v.picklist(["free", "topic", "diverse"] as const));

export const essayAiContextSchema = v.object({
  mode: essayModeInputSchema,
  prompt: v.optional(v.pipe(v.string(), v.maxLength(MAX_ESSAY_PROMPT_CHARS))),
});

export const essayBodyInputSchema = v.object({
  ...essayAiContextSchema.entries,
  text: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
});

export const essayScoreInputSchema = v.object({
  ...essayBodyInputSchema.entries,
});

export const dailyPromptInputSchema = v.object({
  dateKey: v.pipe(v.string(), v.minLength(10), v.maxLength(10)),
  mode: v.picklist(["diverse", "topic"] as const),
});

export const scoreObjectSchema = scoreSchema;

export type EssayAiContext = v.InferOutput<typeof essayAiContextSchema>;
export type EssayBodyInput = v.InferOutput<typeof essayBodyInputSchema>;
export type DailyPromptInput = v.InferOutput<typeof dailyPromptInputSchema>;

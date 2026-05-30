import * as v from "valibot";

import {
  DIFF_COMMENT_KIND,
  ESSAY_MODE,
  ESSAY_STATUS,
  MAX_ESSAY_BODY_CHARS,
  SCORE_CEFR,
} from "~/features/essays/constants/essay";

const essayModeSchema = v.picklist(ESSAY_MODE);
const essayStatusSchema = v.picklist(ESSAY_STATUS);

export const essayDraftSchema = v.pipe(
  v.object({
    bodyBefore: v.pipe(
      v.string(),
      v.minLength(1, "本文を入力してください"),
      v.maxLength(MAX_ESSAY_BODY_CHARS, "本文は 10,000 文字以内で入力してください"),
    ),
    mode: essayModeSchema,
    prompt: v.optional(v.string()),
  }),
  v.check(
    (input) =>
      input.mode !== "topic" || (typeof input.prompt === "string" && input.prompt.length > 0),
    "トピック選択式の場合はトピックを選択してください",
  ),
);

export const scoreSchema = v.object({
  cefr: v.picklist(SCORE_CEFR),
  score: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  scoreFeedback: v.string(),
  toeicMax: v.number(),
  toeicMin: v.number(),
});

export const diffCommentInputSchema = v.object({
  body: v.pipe(v.string(), v.minLength(1, "コメントを入力してください")),
  lineNumber: v.number(),
  side: v.picklist(["deletions", "additions"]),
  suggestion: v.optional(v.string()),
});

const diffCommentSchema = v.object({
  ...diffCommentInputSchema.entries,
  createdAt: v.date(),
  id: v.string(),
  kind: v.picklist(DIFF_COMMENT_KIND),
  updatedAt: v.optional(v.date()),
  userId: v.string(),
});

const essaySchema = v.object({
  bodyAfter: v.optional(v.string()),
  bodyBefore: v.string(),
  cefr: v.optional(v.string()),
  createdAt: v.date(),
  id: v.string(),
  mode: essayModeSchema,
  prompt: v.optional(v.string()),
  score: v.optional(v.number()),
  scoreFeedback: v.optional(v.string()),
  status: essayStatusSchema,
  toeicMax: v.optional(v.number()),
  toeicMin: v.optional(v.number()),
  updatedAt: v.date(),
});

export type EssayMode = v.InferOutput<typeof essayModeSchema>;
export type EssayStatus = v.InferOutput<typeof essayStatusSchema>;
export type Essay = v.InferOutput<typeof essaySchema>;
export type EssayDraftInput = v.InferOutput<typeof essayDraftSchema>;
export type Score = v.InferOutput<typeof scoreSchema>;
export type DiffCommentInput = v.InferOutput<typeof diffCommentInputSchema>;
export type DiffComment = v.InferOutput<typeof diffCommentSchema>;

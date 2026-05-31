import * as v from "valibot";

export const aiTopicsSchema = v.object({
  topics: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(6)),
});

export const aiDiverseSchema = v.object({
  question: v.string(),
});

export const aiCorrectedBodySchema = v.object({
  correctedBody: v.string(),
});

const aiCommentItemSchema = v.object({
  body: v.string(),
  snippet: v.string(),
  suggestion: v.optional(v.string()),
});

//! 添削フェーズ2: 行へ照合する snippet 付きコメント。
//? snippet は correctedBody から一字一句コピーした 1 行以内の文字列。サーバ側で
//? snippet を行に照合し lineNumber / side を決定する（LLM の行番号を信用しない）。
export const aiCommentsSchema = v.object({
  comments: v.array(aiCommentItemSchema),
});

export type AiTopics = v.InferOutput<typeof aiTopicsSchema>;
export type AiDiverse = v.InferOutput<typeof aiDiverseSchema>;
export type AiCorrectedBody = v.InferOutput<typeof aiCorrectedBodySchema>;
export type AiComments = v.InferOutput<typeof aiCommentsSchema>;
export type AiCommentItem = v.InferOutput<typeof aiCommentItemSchema>;

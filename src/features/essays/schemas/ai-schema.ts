import * as v from "valibot";

/** トピック選択（B）: AI が 3 つの英文トピックを返す */
export const aiTopicsSchema = v.object({
  topics: v.pipe(v.array(v.string()), v.length(3)),
});

/** 多様なお題（C）: AI が 1 つの英文の問いを返す */
export const aiDiverseSchema = v.object({
  question: v.string(),
});

/**
 * 添削: AI が添削後全文と、行へ照合するための snippet 付きコメントを返す。
 * snippet は correctedBody から一字一句コピーした 1 行以内の文字列。サーバ側で
 * snippet を行に照合し lineNumber / side を決定する（LLM の行番号を信用しない）。
 */
export const aiCorrectionSchema = v.object({
  comments: v.array(
    v.object({
      body: v.string(),
      snippet: v.string(),
      suggestion: v.optional(v.string()),
    }),
  ),
  correctedBody: v.string(),
});

export type AiTopics = v.InferOutput<typeof aiTopicsSchema>;
export type AiDiverse = v.InferOutput<typeof aiDiverseSchema>;
export type AiCorrection = v.InferOutput<typeof aiCorrectionSchema>;

import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";
import * as v from "valibot";

import { mockCorrect, type CorrectionResult } from "~/features/essays/api/mock-ai";
import { MAX_ESSAY_BODY_CHARS } from "~/features/essays/constants/essay";
import { aiCorrectionSchema, type AiCorrection } from "~/features/essays/schemas/ai-schema";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const correctInputSchema = v.object({
  mode: v.optional(v.string()),
  prompt: v.optional(v.string()),
  text: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
});

const CORRECT_SYSTEM = [
  "You are an English writing proofreader for Japanese learners.",
  "Correct grammar, word choice, and clarity while preserving the writer's meaning and line/paragraph structure.",
  "Return the full corrected essay text, plus a list of comments.",
  "Each comment includes: snippet (a substring copied verbatim from the corrected text, at most one line), body (the issue, in English), and suggestion (how to improve, in English).",
  "Never invent line numbers; only copy snippets verbatim so they can be located.",
].join(" ");

const correctEssayFn = createServerFn({ method: "POST" })
  .inputValidator(correctInputSchema)
  .handler(async ({ data }): Promise<CorrectionResult> => {
    if (!isAiEnabled()) {
      return mockCorrect(data.text, { mode: data.mode, prompt: data.prompt });
    }

    const topicNote =
      data.mode === "topic" && data.prompt
        ? ` The essay should address this topic: "${data.prompt}". Add a comment if it strays off-topic.`
        : "";

    const { output } = await generateText({
      maxOutputTokens: 8000,
      model: AI_MODEL,
      output: Output.object({ schema: valibotSchema(aiCorrectionSchema) }),
      prompt: `Proofread the following English essay.${topicNote}\n\n---\n${data.text}\n---`,
      system: CORRECT_SYSTEM,
      temperature: 0.3,
    });

    return resolveComments(output, data.text);
  });

/** snippet を correctedBody の行に照合して lineNumber を確定する（LLM の行番号は信用しない） */
function resolveComments(object: AiCorrection, originalText: string): CorrectionResult {
  // 前後完全一致だと @pierre/diffs の hunk が 0 になり本文が描画されない
  const correctedBody =
    object.correctedBody === originalText ? `${object.correctedBody}\n` : object.correctedBody;

  const lines = correctedBody.split("\n");
  const comments: CorrectionResult["comments"] = [];

  for (const comment of object.comments) {
    const snippet = comment.snippet.trim();
    if (!snippet) {
      continue;
    }

    // 複数一致は最初の行、未一致はスキップ
    const idx = lines.findIndex((line) => line.includes(snippet));
    if (idx === -1) {
      continue;
    }

    comments.push({
      body: comment.body,
      lineNumber: idx + 1,
      side: "additions",
      ...(comment.suggestion ? { suggestion: comment.suggestion } : {}),
    });
  }

  return { comments, correctedBody };
}

type CorrectEssayParams = { mode?: string; prompt?: string; text: string };

export function correctEssay(params: CorrectEssayParams) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => correctEssayFn({ data: params }),
  });
}

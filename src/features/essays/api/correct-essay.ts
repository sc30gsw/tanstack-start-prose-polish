import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";
import * as v from "valibot";

import {
  mockCorrectBody,
  mockGenerateComments,
  type CorrectionComment,
} from "~/features/essays/api/mock-ai";
import { MAX_ESSAY_BODY_CHARS } from "~/features/essays/constants/essay";
import {
  aiCommentsSchema,
  aiCorrectedBodySchema,
  type AiComments,
} from "~/features/essays/schemas/ai-schema";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const MAX_AI_COMMENTS = 8;

const correctInputSchema = v.object({
  mode: v.optional(v.string()),
  prompt: v.optional(v.string()),
  text: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
});

const commentsInputSchema = v.object({
  correctedBody: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
  mode: v.optional(v.string()),
  prompt: v.optional(v.string()),
  text: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
});

const CORRECT_BODY_SYSTEM = [
  "You are an English writing proofreader for Japanese learners.",
  "Correct grammar, word choice, and clarity while preserving the writer's meaning and line/paragraph structure.",
  "Return only the full corrected essay text.",
].join(" ");

const COMMENTS_SYSTEM = [
  "You are an English writing tutor for Japanese learners.",
  `Return at most ${MAX_AI_COMMENTS} comments for the most important issues only.`,
  "Each comment includes: snippet (a substring copied verbatim from the CORRECTED text, at most one line), body (the issue, in English), and suggestion (how to improve, in English).",
  "Never invent line numbers; only copy snippets verbatim from the corrected essay.",
].join(" ");

const correctEssayBodyFn = createServerFn({ method: "POST" })
  .inputValidator(correctInputSchema)
  .handler(async ({ data }): Promise<{ correctedBody: string }> => {
    if (!isAiEnabled()) {
      return mockCorrectBody(data.text, { mode: data.mode, prompt: data.prompt });
    }

    const topicNote =
      data.mode === "topic" && data.prompt
        ? ` The essay should address this topic: "${data.prompt}".`
        : "";

    const { output } = await generateText({
      maxOutputTokens: estimateBodyOutputTokens(data.text.length),
      model: AI_MODEL,
      output: Output.object({ schema: valibotSchema(aiCorrectedBodySchema) }),
      prompt: `Proofread the following English essay.${topicNote}\n\n---\n${data.text}\n---`,
      system: CORRECT_BODY_SYSTEM,
      temperature: 0.3,
    });

    return {
      correctedBody: normalizeCorrectedBody(output.correctedBody, data.text),
    };
  });

const generateEssayCommentsFn = createServerFn({ method: "POST" })
  .inputValidator(commentsInputSchema)
  .handler(async ({ data }): Promise<{ comments: CorrectionComment[] }> => {
    if (!isAiEnabled()) {
      return mockGenerateComments(data.text, data.correctedBody, {
        mode: data.mode,
        prompt: data.prompt,
      });
    }

    const topicNote =
      data.mode === "topic" && data.prompt
        ? ` The essay should address this topic: "${data.prompt}". Add a comment if it strays off-topic.`
        : "";

    const { output } = await generateText({
      maxOutputTokens: 2048,
      model: AI_MODEL,
      output: Output.object({ schema: valibotSchema(aiCommentsSchema) }),
      prompt: [
        `Review the original and corrected essays.${topicNote}`,
        "Identify the most important remaining teaching points.",
        "",
        "ORIGINAL:",
        "---",
        data.text,
        "---",
        "",
        "CORRECTED:",
        "---",
        data.correctedBody,
        "---",
      ].join("\n"),
      system: COMMENTS_SYSTEM,
      temperature: 0.3,
    });

    return {
      comments: resolveComments(output, data.correctedBody),
    };
  });

function estimateBodyOutputTokens(charCount: number) {
  return Math.min(8000, Math.max(1024, charCount * 2));
}

function normalizeCorrectedBody(correctedBody: string, originalText: string) {
  // 前後完全一致だと @pierre/diffs の hunk が 0 になり本文が描画されない
  return correctedBody === originalText ? `${correctedBody}\n` : correctedBody;
}

/** snippet を correctedBody の行に照合して lineNumber を確定する（LLM の行番号は信用しない） */
function resolveComments(object: AiComments, correctedBody: string): CorrectionComment[] {
  const lines = correctedBody.split("\n");
  const comments: CorrectionComment[] = [];

  for (const comment of object.comments.slice(0, MAX_AI_COMMENTS)) {
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

  return comments;
}

type CorrectEssayParams = { mode?: string; prompt?: string; text: string };

type GenerateCommentsParams = CorrectEssayParams & { correctedBody: string };

export function correctEssayBody(params: CorrectEssayParams) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => correctEssayBodyFn({ data: params }),
  });
}

export function generateEssayComments(params: GenerateCommentsParams) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => generateEssayCommentsFn({ data: params }),
  });
}

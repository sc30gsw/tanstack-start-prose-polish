import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";
import * as v from "valibot";

import { requireInstantAuthMiddleware } from "~/features/auth/middleware/require-instant-auth-middleware";
import { mockCorrectBody, mockGenerateComments } from "~/features/essays/api/mock-ai";
import { MAX_ESSAY_BODY_CHARS } from "~/features/essays/constants/essay";
import { aiCommentsSchema, aiCorrectedBodySchema } from "~/features/essays/schemas/ai-schema";
import {
  essayBodyInputSchema,
  essayAiContextSchema,
  type EssayAiContext,
} from "~/features/essays/schemas/essay-ai-input-schema";
import {
  normalizeCorrectedBody,
  resolveComments,
} from "~/features/essays/utils/correction-comment-resolution";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const commentsInputSchema = v.object({
  correctedBody: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
  ...essayAiContextSchema.entries,
  text: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ESSAY_BODY_CHARS)),
});

const CORRECT_BODY_SYSTEM = [
  "You are an English writing proofreader for Japanese learners.",
  "Correct grammar, word choice, and clarity while preserving the writer's meaning and line/paragraph structure.",
  "Return only the full corrected essay text.",
].join(" ");

const COMMENTS_SYSTEM = [
  "You are an English writing tutor for Japanese learners.",
  "Return at most 8 comments for the most important issues only.",
  "Each comment includes: snippet (a substring copied verbatim from the CORRECTED text, at most one line), body (the issue, in English), and suggestion (how to improve, in English).",
  "Never invent line numbers; only copy snippets verbatim from the corrected essay.",
].join(" ");

function topicNote(mode: EssayAiContext["mode"], prompt?: EssayAiContext["prompt"]) {
  return mode === "topic" && prompt ? prompt : null;
}

const correctEssayBodyFn = createServerFn({ method: "POST" })
  .middleware([requireInstantAuthMiddleware])
  .inputValidator(essayBodyInputSchema)
  .handler(async ({ data }) => {
    if (!isAiEnabled()) {
      return mockCorrectBody(data.text, { mode: data.mode, prompt: data.prompt });
    }

    const prompt = topicNote(data.mode, data.prompt);
    const topicSuffix = prompt ? ` The essay should address this topic: "${prompt}".` : "";

    const { output } = await generateText({
      maxOutputTokens: estimateBodyOutputTokens(data.text.length),
      model: AI_MODEL,
      output: Output.object({ schema: valibotSchema(aiCorrectedBodySchema) }),
      prompt: `Proofread the following English essay.${topicSuffix}\n\n---\n${data.text}\n---`,
      system: CORRECT_BODY_SYSTEM,
      temperature: 0.3,
    });

    return {
      correctedBody: normalizeCorrectedBody(output.correctedBody, data.text),
    };
  });

const generateEssayCommentsFn = createServerFn({ method: "POST" })
  .middleware([requireInstantAuthMiddleware])
  .inputValidator(commentsInputSchema)
  .handler(async ({ data }) => {
    if (!isAiEnabled()) {
      return mockGenerateComments(data.text, data.correctedBody, {
        mode: data.mode,
        prompt: data.prompt,
      });
    }

    const prompt = topicNote(data.mode, data.prompt);
    const topicSuffix = prompt
      ? ` The essay should address this topic: "${prompt}". Add a comment if it strays off-topic.`
      : "";

    const { output } = await generateText({
      maxOutputTokens: 2048,
      model: AI_MODEL,
      output: Output.object({ schema: valibotSchema(aiCommentsSchema) }),
      prompt: [
        `Review the original and corrected essays.${topicSuffix}`,
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

export function correctEssayBody(params: v.InferInput<typeof essayBodyInputSchema>) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => correctEssayBodyFn({ data: params }),
  });
}

export function generateEssayComments(params: v.InferInput<typeof commentsInputSchema>) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => generateEssayCommentsFn({ data: params }),
  });
}

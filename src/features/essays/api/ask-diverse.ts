import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";

import { mockDiverseQuestion } from "~/features/essays/api/mock-ai";
import { aiDiverseSchema } from "~/features/essays/schemas/ai-schema";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const DIVERSE_SYSTEM =
  "You are an English writing tutor for Japanese learners. Produce a single thought-provoking writing prompt in English, varying the category across hypotheticals, culture, ethics, and personal opinion.";

const askDiverseFn = createServerFn({ method: "POST" }).handler(async () => {
  if (!isAiEnabled()) {
    return { question: mockDiverseQuestion() };
  }

  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.object({ schema: valibotSchema(aiDiverseSchema) }),
    prompt:
      "Write one engaging English essay question (1-3 sentences) that asks the writer to imagine a scenario, explain a cultural perspective, or state an opinion.",
    system: DIVERSE_SYSTEM,
    temperature: 0.9,
  });

  return { question: output.question };
});

export function askDiverse() {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: async () => (await askDiverseFn()).question,
  });
}

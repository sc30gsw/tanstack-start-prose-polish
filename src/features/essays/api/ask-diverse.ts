import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";

import { requireInstantAuthMiddleware } from "~/features/auth/middleware/require-instant-auth-middleware";
import { getCachedDailyPrompt, saveDailyPrompt } from "~/features/essays/api/daily-prompt-cache";
import { mockDiverseQuestion } from "~/features/essays/api/mock-ai";
import { aiDiverseSchema } from "~/features/essays/schemas/ai-schema";
import {
  dailyPromptInputSchema,
  type DailyPromptInput,
} from "~/features/essays/schemas/essay-ai-input-schema";
import { EssayAiError } from "~/features/essays/types/essay-error";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const DIVERSE_SYSTEM =
  "You are an English writing tutor for Japanese learners. Produce a single thought-provoking writing prompt in English, varying the category across hypotheticals, culture, ethics, and personal opinion.";

const askDiverseFn = createServerFn({ method: "POST" })
  .middleware([requireInstantAuthMiddleware])
  .inputValidator(dailyPromptInputSchema)
  .handler(async ({ context, data }) => {
    const cached = await getCachedDailyPrompt(context.user.id, data.dateKey, "diverse");

    if (cached && typeof cached.payload === "string") {
      return { question: cached.payload };
    }

    const question = !isAiEnabled()
      ? mockDiverseQuestion()
      : (
          await generateText({
            model: AI_MODEL,
            output: Output.object({ schema: valibotSchema(aiDiverseSchema) }),
            prompt:
              "Write one engaging English essay question (1-3 sentences) that asks the writer to imagine a scenario, explain a cultural perspective, or state an opinion.",
            system: DIVERSE_SYSTEM,
            temperature: 0.9,
          })
        ).output.question;

    await saveDailyPrompt(context.user.id, data.dateKey, "diverse", question);

    return { question };
  });

export function askDiverse(dateKey: DailyPromptInput["dateKey"]) {
  return Result.tryPromise({
    catch: (e) =>
      new EssayAiError({
        cause: e,
        message: e instanceof Error ? e.message : "お題の生成に失敗しました",
      }),
    try: async () => (await askDiverseFn({ data: { dateKey, mode: "diverse" } })).question,
  });
}

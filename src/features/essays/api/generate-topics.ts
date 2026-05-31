import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";

import { requireInstantAuthMiddleware } from "~/features/auth/middleware/require-instant-auth-middleware";
import { getCachedDailyPrompt, saveDailyPrompt } from "~/features/essays/api/daily-prompt-cache";
import { mockTopics } from "~/features/essays/api/mock-ai";
import { aiTopicsSchema } from "~/features/essays/schemas/ai-schema";
import {
  dailyPromptInputSchema,
  type DailyPromptInput,
} from "~/features/essays/schemas/essay-ai-input-schema";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const TOPICS_SYSTEM =
  "You are an English writing tutor for Japanese learners. Produce engaging, thought-provoking essay topics written in English that can be answered in a short essay.";

const generateTopicsFn = createServerFn({ method: "POST" })
  .middleware([requireInstantAuthMiddleware])
  .inputValidator(dailyPromptInputSchema)
  .handler(async ({ context, data }) => {
    const cached = await getCachedDailyPrompt(context.user.id, data.dateKey, "topic");

    if (cached && Array.isArray(cached.payload)) {
      return { topics: cached.payload as string[] };
    }

    const topics = !isAiEnabled()
      ? mockTopics()
      : (
          await generateText({
            model: AI_MODEL,
            output: Output.object({ schema: valibotSchema(aiTopicsSchema) }),
            prompt:
              "Generate exactly 3 distinct English essay topics covering different themes (e.g. society, technology, ethics, culture). Each topic is one or two sentences and invites a clear argument.",
            system: TOPICS_SYSTEM,
            temperature: 0.9,
          })
        ).output.topics;

    await saveDailyPrompt(context.user.id, data.dateKey, "topic", topics);

    return { topics };
  });

export function generateTopics(dateKey: DailyPromptInput["dateKey"]) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: async () => (await generateTopicsFn({ data: { dateKey, mode: "topic" } })).topics,
  });
}

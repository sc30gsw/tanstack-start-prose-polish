import { valibotSchema } from "@ai-sdk/valibot";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { Result } from "better-result";

import { mockTopics } from "~/features/essays/api/mock-ai";
import { aiTopicsSchema } from "~/features/essays/schemas/ai-schema";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const TOPICS_SYSTEM =
  "You are an English writing tutor for Japanese learners. Produce engaging, thought-provoking essay topics written in English that can be answered in a short essay.";

const generateTopicsFn = createServerFn({ method: "POST" }).handler(async () => {
  if (!isAiEnabled()) {
    return { topics: mockTopics() };
  }

  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.object({ schema: valibotSchema(aiTopicsSchema) }),
    prompt:
      "Generate exactly 3 distinct English essay topics covering different themes (e.g. society, technology, ethics, culture). Each topic is one or two sentences and invites a clear argument.",
    system: TOPICS_SYSTEM,
    temperature: 0.9,
  });

  return { topics: output.topics };
});

export function generateTopics() {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: async () => (await generateTopicsFn()).topics,
  });
}

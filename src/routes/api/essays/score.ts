import { valibotSchema } from "@ai-sdk/valibot";
import { createFileRoute } from "@tanstack/react-router";
import { Output, streamText } from "ai";
import { Result } from "better-result";
import * as v from "valibot";

import { requireInstantUser } from "~/features/auth/server/verify-instant-user";
import { mockScore } from "~/features/essays/api/mock-ai";
import {
  essayScoreInputSchema,
  type EssayAiContext,
  type EssayBodyInput,
} from "~/features/essays/schemas/essay-ai-input-schema";
import { scoreSchema } from "~/features/essays/schemas/essay-schema";
import { topicPrompt } from "~/features/essays/utils/topic-prompt";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const SCORE_SYSTEM = [
  "You are an English writing assessor for Japanese learners. Score the essay holistically.",
  "Provide score (0-100 integer), cefr (one of A1, A2, B1, B2, C1, C2), toeicMin and toeicMax (a plausible TOEIC L&R range between 10 and 990), and scoreFeedback (2-3 sentences in JAPANESE).",
  "Keep score, cefr, and the TOEIC range mutually consistent: a higher score implies a higher CEFR and TOEIC range.",
  "Rough CEFR-to-score guide: A1 below 40, A2 40-53, B1 54-67, B2 68-79, C1 80-89, C2 90-100.",
  "When a topic is given, also provide topicRelevance (one of on_topic, partial, off_topic) and topicFeedback (1-2 sentences in JAPANESE explaining the judgment).",
  "Topic relevance is an independent axis: it must NOT affect score, cefr, or the TOEIC range, and scoreFeedback must not mention topic relevance.",
  "When no topic is given, omit topicRelevance and topicFeedback.",
  "Emit the fields in this order: score, scoreFeedback, cefr, toeicMin, toeicMax, topicRelevance, topicFeedback.",
].join(" ");

export const Route = createFileRoute("/api/essays/score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authResult = await requireInstantUser(request);
        if (Result.isError(authResult)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const bodyResult = await Result.tryPromise(() => request.json());
        if (Result.isError(bodyResult)) {
          return new Response("Invalid JSON", { status: 400 });
        }

        const parsed = v.safeParse(essayScoreInputSchema, bodyResult.value);
        if (!parsed.success) {
          return new Response("Invalid request body", { status: 400 });
        }

        const { mode, prompt, text } = parsed.output;

        if (!isAiEnabled()) {
          return mockScoreStreamResponse(text, { mode, prompt });
        }

        const result = streamText({
          model: AI_MODEL,
          output: Output.object({ schema: valibotSchema(scoreSchema) }),
          prompt: buildScorePrompt(text, mode, prompt),
          system: SCORE_SYSTEM,
        });

        return result.toTextStreamResponse();
      },
    },
  },
});

function buildScorePrompt(
  text: EssayBodyInput["text"],
  mode: EssayAiContext["mode"],
  prompt: EssayAiContext["prompt"],
) {
  const topic = topicPrompt(mode, prompt);
  const topicNote = topic ? ` Also judge topic relevance against this topic: "${topic}".` : "";

  return `Assess this English essay and score it.${topicNote}\n\n---\n${text}\n---`;
}

/** キー未設定時のフォールバック。mock スコアを 3 段階に分け擬似ストリーム配信する */
function mockScoreStreamResponse(
  text: EssayBodyInput["text"],
  opts: Pick<EssayAiContext, "mode" | "prompt">,
) {
  const s = mockScore(text, opts);
  const topicSlice =
    s.topicRelevance != null
      ? `,"topicRelevance":${JSON.stringify(s.topicRelevance)},"topicFeedback":${JSON.stringify(s.topicFeedback ?? "")}`
      : "";
  const slices = [
    `{"score":${s.score},"scoreFeedback":${JSON.stringify(s.scoreFeedback)}`,
    `,"cefr":${JSON.stringify(s.cefr)}`,
    `,"toeicMin":${s.toeicMin},"toeicMax":${s.toeicMax}`,
    `${topicSlice}}`,
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      for (const slice of slices) {
        controller.enqueue(encoder.encode(slice));
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

import { valibotSchema } from "@ai-sdk/valibot";
import { createFileRoute } from "@tanstack/react-router";
import { Output, streamText } from "ai";

import { mockScore } from "~/features/essays/api/mock-ai";
import { scoreSchema } from "~/features/essays/schemas/essay-schema";
import { AI_MODEL, isAiEnabled } from "~/lib/ai/model";

const SCORE_SYSTEM = [
  "You are an English writing assessor for Japanese learners. Score the essay holistically.",
  "Provide score (0-100 integer), cefr (one of A1, A2, B1, B2, C1, C2), toeicMin and toeicMax (a plausible TOEIC L&R range between 10 and 990), and scoreFeedback (2-3 sentences in JAPANESE).",
  "Keep score, cefr, and the TOEIC range mutually consistent: a higher score implies a higher CEFR and TOEIC range.",
  "Rough CEFR-to-score guide: A1 below 40, A2 40-53, B1 54-67, B2 68-79, C1 80-89, C2 90-100.",
  "Emit the fields in this order: score, scoreFeedback, cefr, toeicMin, toeicMax.",
].join(" ");

type ScoreRequestBody = { mode?: string; prompt?: string; text?: string };

export const Route = createFileRoute("/api/essays/score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ScoreRequestBody;
        const text = typeof body.text === "string" ? body.text : "";
        const mode = typeof body.mode === "string" ? body.mode : undefined;
        const prompt = typeof body.prompt === "string" ? body.prompt : undefined;

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
  text: NonNullable<ScoreRequestBody["text"]>,
  mode: ScoreRequestBody["mode"],
  prompt: ScoreRequestBody["prompt"],
) {
  const topicNote =
    mode === "topic" && prompt ? ` Also judge how well it addresses the topic: "${prompt}".` : "";

  return `Assess this English essay and score it.${topicNote}\n\n---\n${text}\n---`;
}

/** キー未設定時のフォールバック。mock スコアを 3 段階に分け擬似ストリーム配信する */
function mockScoreStreamResponse(
  text: NonNullable<ScoreRequestBody["text"]>,
  opts: Pick<ScoreRequestBody, "mode" | "prompt">,
): Response {
  const s = mockScore(text, opts);
  const slices = [
    `{"score":${s.score},"scoreFeedback":${JSON.stringify(s.scoreFeedback)}`,
    `,"cefr":${JSON.stringify(s.cefr)}`,
    `,"toeicMin":${s.toeicMin},"toeicMax":${s.toeicMax}}`,
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

import type { InstaQLEntity } from "@instantdb/react";
import { id } from "@instantdb/react";
import { useCallback, useState, useTransition } from "react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { scoreEssay } from "~/features/essay-feedback/api/mock-ai";
import type { Essay, Score } from "~/features/essay-feedback/schemas/essay-schema";
import type { ScoringState } from "~/features/essay-feedback/types/essay";
import { isEveryNonNull } from "~/lib/every-non-null";

type StartOpts = Partial<Pick<Essay, "mode" | "prompt">>;

const INITIAL_STATE = {
  feedbackReady: false,
  result: {},
  stage: "idle",
} as const satisfies ScoringState;

export function useScoringStream() {
  const [state, setState] = useState<ScoringState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const start = useCallback(
    (
      essayId: InstaQLEntity<AppSchema, "essays">["id"],
      text: InstaQLEntity<AppSchema, "essays">["bodyBefore"],
      signal: AbortSignal,
      opts?: StartOpts,
    ) => {
      startTransition(async () => {
        setState({ feedbackReady: false, result: {}, stage: "score" });

        const accumulated: Partial<Score> = {};

        for await (const chunk of scoreEssay(text, opts)) {
          if (signal.aborted) {
            return;
          }

          Object.assign(accumulated, chunk);

          const nextStage = chunk.score
            ? "cefr"
            : chunk.cefr
              ? "toeic"
              : chunk.toeicMin
                ? "done"
                : null;

          if (nextStage === null) {
            continue;
          }

          setState((prev) => ({ ...prev, result: { ...accumulated }, stage: nextStage }));
        }

        if (signal.aborted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          result: { ...prev.result, ...accumulated },
          stage: "done",
        }));

        const scoring = [
          accumulated.score,
          accumulated.scoreFeedback,
          accumulated.cefr,
          accumulated.toeicMin,
          accumulated.toeicMax,
        ] as const;

        if (isEveryNonNull(scoring)) {
          const [score, scoreFeedback, cefr, toeicMin, toeicMax] = scoring;
          const scoreId = id();
          const txScore = db.tx.scores[scoreId];

          if (!txScore) {
            return;
          }

          await db.transact(
            txScore
              .update({ cefr, score, scoreFeedback, toeicMax, toeicMin })
              .link({ essay: essayId }),
          );
        }
      });
    },
    [startTransition],
  );

  const hydrate = useCallback((score: Score) => {
    setState({ feedbackReady: true, result: score, stage: "done" });
  }, []);

  const markFeedbackReady = useCallback(() => {
    setState((prev) => ({ ...prev, feedbackReady: true }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { hydrate, markFeedbackReady, reset, start, state, isPending } as const;
}

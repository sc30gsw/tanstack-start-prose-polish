import { useCallback, useState, useTransition } from "react";

import { scoreEssay } from "~/features/essay-feedback/api/mock-ai";
import type { Essay, Score } from "~/features/essay-feedback/schemas/essay-schema";
import type { ScoringState } from "~/features/essay-feedback/types/essay";

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
    (text: string, signal: AbortSignal, opts?: StartOpts) => {
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
      });
    },
    [startTransition],
  );

  const markFeedbackReady = useCallback(() => {
    setState((prev) => ({ ...prev, feedbackReady: true }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { markFeedbackReady, reset, start, state, isPending } as const;
}

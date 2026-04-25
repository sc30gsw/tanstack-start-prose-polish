import { useCallback, useState } from "react";

import { scoreEssay } from "~/features/essay-feedback/api/mock-ai";
import type { Score } from "~/features/essay-feedback/schemas/essay-schema";
import type { ScoringState } from "~/features/essay-feedback/types/essay";

type StartOpts = { mode?: string; prompt?: string };

const INITIAL_STATE: ScoringState = {
  feedbackReady: false,
  result: {},
  stage: "idle",
};

export function useScoringStream() {
  const [state, setState] = useState<ScoringState>(INITIAL_STATE);

  const start = useCallback(async (text: string, signal: AbortSignal, opts?: StartOpts) => {
    setState({ feedbackReady: false, result: {}, stage: "score" });

    const accumulated: Partial<Score> = {};

    for await (const chunk of scoreEssay(text, opts)) {
      if (signal.aborted) return;

      Object.assign(accumulated, chunk);

      if (chunk.score !== undefined) {
        setState((prev) => ({ ...prev, result: { ...accumulated }, stage: "cefr" }));
      } else if (chunk.cefr !== undefined) {
        setState((prev) => ({ ...prev, result: { ...accumulated }, stage: "toeic" }));
      } else if (chunk.toeicMin !== undefined) {
        setState((prev) => ({ ...prev, result: { ...accumulated }, stage: "done" }));
      }
    }
  }, []);

  const markFeedbackReady = useCallback(() => {
    setState((prev) => ({ ...prev, feedbackReady: true }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { markFeedbackReady, reset, start, state };
}

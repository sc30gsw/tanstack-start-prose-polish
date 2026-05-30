import { experimental_useObject as useObject } from "@ai-sdk/react";
import { valibotSchema } from "@ai-sdk/valibot";
import type { InstaQLEntity } from "@instantdb/react";
import { id } from "@instantdb/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { scoreSchema, type Essay, type Score } from "~/features/essays/schemas/essay-schema";
import type { ScoringState } from "~/features/essays/types/essay";
import { isEveryNonNull } from "~/lib/every-non-null";

type StartOpts = Partial<Pick<Essay, "mode" | "prompt">>;
type SubmitArgs = { mode?: string; prompt?: string; text: string };

export function useScoringStream() {
  const [stage, setStage] = useState<ScoringState["stage"]>("idle");
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [hydrated, setHydrated] = useState<null | Score>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const essayIdRef = useRef<null | string>(null);
  const lastArgsRef = useRef<null | SubmitArgs>(null);

  const { error, isLoading, object, submit } = useObject({
    api: "/api/essays/score",
    onError: (e) => setErrorMessage(e.message),
    onFinish: async ({ object: finalObject }) => {
      if (!finalObject) {
        setErrorMessage("採点結果の解析に失敗しました");
        return;
      }

      setStage("done");

      const essayId = essayIdRef.current;
      const scoring = [
        finalObject.score,
        finalObject.scoreFeedback,
        finalObject.cefr,
        finalObject.toeicMin,
        finalObject.toeicMax,
      ] as const;

      if (essayId && isEveryNonNull(scoring)) {
        const [score, scoreFeedback, cefr, toeicMin, toeicMax] = scoring;
        const scoreId = id();
        const txScore = db.tx.scores[scoreId];

        if (txScore) {
          await db.transact(
            txScore
              .update({ cefr, score, scoreFeedback, toeicMax, toeicMin })
              .link({ essay: essayId }),
          );
        }
      }
    },
    schema: valibotSchema(scoreSchema),
  });

  // 部分オブジェクトの到着フィールドで段階を進める（到着駆動。完了は onFinish で確定）
  useEffect(() => {
    if (!object) {
      return;
    }

    if (object.toeicMin != null && object.toeicMax != null) {
      setStage("done");
    } else if (object.cefr != null) {
      setStage("toeic");
    } else if (object.score != null) {
      setStage("cefr");
    }
  }, [object]);

  const start = useCallback(
    (
      essayId: InstaQLEntity<AppSchema, "essays">["id"],
      text: InstaQLEntity<AppSchema, "essays">["bodyBefore"],
      opts?: StartOpts,
    ) => {
      essayIdRef.current = essayId;
      const args: SubmitArgs = { mode: opts?.mode, prompt: opts?.prompt, text };
      lastArgsRef.current = args;
      setHydrated(null);
      setErrorMessage(null);
      setFeedbackReady(false);
      setStage("score");
      submit(args);
    },
    [submit],
  );

  const retry = useCallback(() => {
    const args = lastArgsRef.current;
    if (!args) {
      return;
    }

    setErrorMessage(null);
    setStage("score");
    submit(args);
  }, [submit]);

  const hydrate = useCallback((score: Score) => {
    setHydrated(score);
    setFeedbackReady(true);
    setStage("done");
  }, []);

  const markFeedbackReady = useCallback(() => {
    setFeedbackReady(true);
  }, []);

  const reset = useCallback(() => {
    setHydrated(null);
    setErrorMessage(null);
    setFeedbackReady(false);
    setStage("idle");
  }, []);

  const state = {
    feedbackReady,
    result: (hydrated ?? object ?? {}) as Partial<Score>,
    stage,
  } satisfies ScoringState;

  return {
    error: errorMessage ?? error?.message ?? null,
    hydrate,
    isPending: isLoading,
    markFeedbackReady,
    reset,
    retry,
    start,
    state,
  } as const;
}

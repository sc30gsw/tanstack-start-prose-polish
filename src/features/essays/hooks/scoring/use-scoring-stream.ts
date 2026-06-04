import { experimental_useObject as useObject } from "@ai-sdk/react";
import { valibotSchema } from "@ai-sdk/valibot";
import type { InstaQLEntity } from "@instantdb/react";
import { id } from "@instantdb/react";
import { Result } from "better-result";
import { useCallback, useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { buildScoreRequestHeaders } from "~/features/essays/api/score-request-headers";
import type {
  EssayAiContext,
  EssayBodyInput,
} from "~/features/essays/schemas/essay-ai-input-schema";
import { scoreSchema, type Essay, type Score } from "~/features/essays/schemas/essay-schema";
import type { ScoringState } from "~/features/essays/types/essay";
import { EssayPersistenceError } from "~/features/essays/types/essay-error";
import { topicPrompt } from "~/features/essays/utils/topic-prompt";
import { isEveryNonNull } from "~/lib/every-non-null";

type StartOpts = Partial<Pick<Essay, "mode" | "prompt">> & {
  existingScoreId?: InstaQLEntity<AppSchema, "scores">["id"];
};
type SubmitArgs = Pick<EssayAiContext, "mode" | "prompt"> & Pick<EssayBodyInput, "text">;

export function useScoringStream() {
  const [stage, setStage] = useState<ScoringState["stage"]>("idle");
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [hydrated, setHydrated] = useState<null | Score>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const essayIdRef = useRef<null | InstaQLEntity<AppSchema, "essays">["id"]>(null);
  const existingScoreIdRef = useRef<null | InstaQLEntity<AppSchema, "scores">["id"]>(null);
  const lastArgsRef = useRef<null | SubmitArgs>(null);

  const { error, isLoading, object, stop, submit } = useObject({
    api: "/api/essays/score",
    headers: () => buildScoreRequestHeaders() ?? {},
    onError: (e) => setErrorMessage(e.message),
    onFinish: async ({ object: finalObject }) => {
      if (!finalObject) {
        setErrorMessage("採点結果の解析に失敗しました");
        return;
      }

      const essayId = essayIdRef.current;
      const scoring = [
        finalObject.score,
        finalObject.scoreFeedback,
        finalObject.cefr,
        finalObject.toeicMin,
        finalObject.toeicMax,
      ] as const satisfies readonly (
        | Score["score"]
        | Score["scoreFeedback"]
        | Score["cefr"]
        | Score["toeicMin"]
        | Score["toeicMax"]
      )[];

      if (!essayId || !isEveryNonNull(scoring)) {
        setStage("done");
        return;
      }

      const [score, scoreFeedback, cefr, toeicMin, toeicMax] = scoring;
      const existingScoreId = existingScoreIdRef.current;
      const scoreId = existingScoreId ?? id();
      const txScore = db.tx.scores[scoreId];

      if (!txScore) {
        setErrorMessage("採点結果の保存に失敗しました");
        setStage("score");
        return;
      }

      //? テーマ適合はテーマあり（topic / diverse）時のみ保存。free で LLM が誤出力しても無視する
      const args = lastArgsRef.current;
      const topicFields =
        topicPrompt(args?.mode, args?.prompt) != null && finalObject.topicRelevance != null
          ? {
              topicFeedback: finalObject.topicFeedback ?? "",
              topicRelevance: finalObject.topicRelevance,
            }
          : {};
      const scorePayload = { cefr, score, scoreFeedback, toeicMax, toeicMin, ...topicFields };

      const result = await Result.tryPromise({
        catch: (e) =>
          new EssayPersistenceError({
            cause: e,
            message: e instanceof Error ? e.message : "採点結果の保存に失敗しました",
          }),
        try: () =>
          db.transact(
            existingScoreId
              ? txScore.update(scorePayload)
              : txScore.update(scorePayload).link({ essay: essayId }),
          ),
      });

      result.match({
        err: (error) => {
          setErrorMessage(error.message);
          setStage("score");
        },
        ok: () => {
          setStage("done");
        },
      });
    },
    schema: valibotSchema(scoreSchema),
  });

  useEffect(() => {
    if (!object) {
      return;
    }

    //? 完了は onFinish が確定する。到着駆動では done に進めない（部分到着で先走らせない）
    const args = lastArgsRef.current;
    if (object.toeicMax != null && topicPrompt(args?.mode, args?.prompt) != null) {
      setStage("topic");
    } else if (object.cefr != null) {
      setStage("toeic");
    } else if (object.score != null) {
      setStage("cefr");
    }
  }, [object]);

  //? アンマウント時にストリームを中断（離脱後の DB 書込・状態更新を防ぐ）
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => () => stopRef.current(), []);

  const start = useCallback(
    (
      essayId: InstaQLEntity<AppSchema, "essays">["id"],
      text: InstaQLEntity<AppSchema, "essays">["bodyBefore"],
      opts?: StartOpts,
    ) => {
      essayIdRef.current = essayId;
      existingScoreIdRef.current = opts?.existingScoreId ?? null;
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

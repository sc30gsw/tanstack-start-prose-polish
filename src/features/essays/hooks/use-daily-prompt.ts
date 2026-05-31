import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from "react";

import { db } from "~/db/instant";
import { useAuthUser } from "~/features/auth/hooks/use-auth-user";
import { askDiverse } from "~/features/essays/api/ask-diverse";
import { generateTopics } from "~/features/essays/api/generate-topics";

type DailyPromptMode = "diverse" | "topic";

function todayKeyJst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

function releaseGenerationLock(
  generatingRef: RefObject<boolean>,
  setIsGenerating: Dispatch<SetStateAction<boolean>>,
) {
  generatingRef.current = false;
  setIsGenerating(false);
}

//! お題（B/C）の日次キャッシュ。(userId, 日付, mode) で InstantDB に永続化し、
//! 同日再訪では AI を呼ばずキャッシュを返す。未キャッシュ時のみ server fn を 1 度だけ呼び、
//? 生成中は ref ロックで多重呼び出しを防ぐ。
export function useDailyPrompt(mode: DailyPromptMode) {
  const { user } = useAuthUser();
  const userId = user?.id;
  const dateKey = todayKeyJst();

  const generatingRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const { data, isLoading } = db.useQuery(
    userId ? { dailyPrompts: { $: { where: { dateKey, mode, userId } } } } : null,
  );

  const row = data?.dailyPrompts?.[0] ?? null;

  const generate = useCallback(async () => {
    if (!userId || generatingRef.current) {
      return;
    }

    generatingRef.current = true;
    setIsGenerating(true);
    setError(null);

    try {
      if (mode === "topic") {
        const result = await generateTopics(dateKey);
        await result.match({
          err: async (e: Error) => {
            setError(e.message);
          },
          ok: async () => {},
        });
        return;
      }

      const result = await askDiverse(dateKey);
      await result.match({
        err: async (e: Error) => {
          setError(e.message);
        },
        ok: async () => {},
      });
    } finally {
      releaseGenerationLock(generatingRef, setIsGenerating);
    }
  }, [userId, dateKey, mode]);

  useEffect(() => {
    if (!userId || isLoading || row || generatingRef.current) {
      return;
    }

    void generate();
  }, [userId, isLoading, row, generate]);

  return {
    error,
    isLoading: isLoading || isGenerating,
    payload: row?.payload,
    retry: generate,
  } as const;
}

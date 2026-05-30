import { id as instantId } from "@instantdb/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";
import { useAuthUser } from "~/features/auth/hooks/use-auth-user";
import { askDiverse } from "~/features/essays/api/ask-diverse";
import { generateTopics } from "~/features/essays/api/generate-topics";

type DailyPromptMode = "diverse" | "topic";

/** JST（Asia/Tokyo）の YYYY-MM-DD。ホスト TZ に依存せず SSR/クライアントで一致する */
function todayKeyJst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

/**
 * お題（B/C）の日次キャッシュ。(userId, 日付, mode) で InstantDB に永続化し、
 * 同日再訪では AI を呼ばずキャッシュを返す。未キャッシュ時のみ server fn を 1 度だけ呼び、
 * 生成中は ref ロックで多重呼び出しを防ぐ。
 */
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

    if (mode === "topic") {
      const result = await generateTopics();
      result.match({
        err: async (e: Error) => {
          setError(e.message);
          generatingRef.current = false;
          setIsGenerating(false);
        },
        ok: async (payload: string[]) => {
          const newId = instantId();
          const tx = db.tx.dailyPrompts[newId];
          if (tx) {
            await db.transact(tx.update({ createdAt: new Date(), dateKey, mode, payload, userId }));
          }
          setIsGenerating(false);
        },
      });
      return;
    }

    const result = await askDiverse();
    result.match({
      err: async (e: Error) => {
        setError(e.message);
        generatingRef.current = false;
        setIsGenerating(false);
      },
      ok: async (payload: string) => {
        const newId = instantId();
        const tx = db.tx.dailyPrompts[newId];
        if (tx) {
          await db.transact(tx.update({ createdAt: new Date(), dateKey, mode, payload, userId }));
        }
        setIsGenerating(false);
      },
    });
  }, [userId, dateKey, mode]);

  // クエリ確定後、キャッシュが無ければ 1 度だけ生成する
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

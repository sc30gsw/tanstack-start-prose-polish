import type { InstaQLEntity } from "@instantdb/react";
import { Result } from "better-result";
import { useState, useTransition } from "react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { persistEssayCorrection } from "~/features/essays/api/persist-essay-correction";

type EssayWithComments = InstaQLEntity<AppSchema, "essays", { comments: {} }>;

//! AI 添削のやり直し。コメント生成が best-effort のため、レート制限などで
//! コメントゼロのまま reviewed になったエッセイを再添削する手段を提供する
export function useRegenerateCorrection() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);

  const regenerate = (
    essay: EssayWithComments,
    userId: InstaQLEntity<AppSchema, "diffComments">["userId"],
  ) => {
    startTransition(async () => {
      setError(null);

      const txStatus = db.tx.essays[essay.id];
      if (!txStatus) {
        setError("再添削の開始に失敗しました");
        return;
      }

      //? 再添削中は status を scoring に戻し、diff / 採点画面を添削中表示にする
      const startResult = await Result.tryPromise(() =>
        db.transact(txStatus.update({ status: "scoring", updatedAt: new Date() })),
      );

      if (Result.isError(startResult)) {
        setError("再添削の開始に失敗しました");
        return;
      }

      //? 旧 AI コメントは削除して重複を防ぐ。ユーザーコメントは残す
      const aiCommentTxs = (essay.comments ?? [])
        .filter((comment) => comment.kind === "ai")
        .flatMap((comment) => {
          const tx = db.tx.diffComments[comment.id];
          return tx ? [tx.delete()] : [];
        });

      if (aiCommentTxs.length > 0) {
        const deleteResult = await Result.tryPromise(() => db.transact(aiCommentTxs));

        if (Result.isError(deleteResult)) {
          setError("既存のAIコメントの削除に失敗しました");
          return;
        }
      }

      //? 失敗時は persistEssayCorrection 内で status が correction_failed に倒される
      const result = await persistEssayCorrection({
        essayId: essay.id,
        mode: essay.mode,
        prompt: essay.prompt,
        text: essay.bodyBefore,
        userId,
      });

      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  return { error, isPending, regenerate } as const;
}

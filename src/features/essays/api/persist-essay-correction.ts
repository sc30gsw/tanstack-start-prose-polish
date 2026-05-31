import { id, type InstaQLEntity } from "@instantdb/react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { correctEssayBody, generateEssayComments } from "~/features/essays/api/correct-essay";
import type { DiffCommentInput, EssayMode } from "~/features/essays/schemas/essay-schema";

type EssayEntity = InstaQLEntity<AppSchema, "essays">;

type PersistEssayCorrectionParams = Pick<EssayEntity, "mode" | "prompt"> & {
  essayId: EssayEntity["id"];
  text: EssayEntity["bodyBefore"];
  userId: InstaQLEntity<AppSchema, "diffComments">["userId"];
};

export type PersistEssayCorrectionResult = Record<"ok", true> | { error: string; ok: false };

function buildCommentTransactions(
  essayId: EssayEntity["id"],
  comments: Array<Pick<DiffCommentInput, "body" | "lineNumber" | "side" | "suggestion">>,
  userId: InstaQLEntity<AppSchema, "diffComments">["userId"],
) {
  const now = new Date();

  return comments.flatMap((comment) => {
    const commentId = id();
    const txComment = db.tx.diffComments[commentId];

    if (!txComment) {
      return [];
    }

    return [
      txComment
        .update({
          body: comment.body,
          createdAt: now,
          kind: "ai",
          lineNumber: comment.lineNumber,
          side: comment.side,
          suggestion: comment.suggestion,
          userId,
        })
        .link({ essay: essayId }),
    ];
  });
}

async function markCorrectionFailed(essayId: EssayEntity["id"]) {
  const txUpdate = db.tx.essays[essayId];
  if (!txUpdate) {
    return;
  }

  await db.transact(
    txUpdate.update({
      status: "correction_failed",
      updatedAt: new Date(),
    }),
  );
}

//! 添削を2段階で永続化する。
//? 1. 添削後本文を先に保存して diff を早く表示可能にする
//? 2. AI コメントはバッチ 1 回で保存する
export async function persistEssayCorrection({
  essayId,
  mode,
  prompt,
  text,
  userId,
}: PersistEssayCorrectionParams) {
  const bodyResult = await correctEssayBody({
    mode: mode as EssayMode,
    prompt,
    text,
  });

  return bodyResult.match({
    err: async (error: Error) => {
      const message = error.message || "添削に失敗しました";
      await markCorrectionFailed(essayId);
      return { error: message, ok: false as const };
    },
    ok: async ({ correctedBody }) => {
      const txUpdate = db.tx.essays[essayId];
      if (!txUpdate) {
        return { error: "エッセイの更新に失敗しました", ok: false as const };
      }

      try {
        await db.transact(
          txUpdate.update({
            bodyAfter: correctedBody,
            status: "reviewed",
            updatedAt: new Date(),
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "添削結果の保存に失敗しました";
        await markCorrectionFailed(essayId);

        return { error: message, ok: false as const };
      }

      const commentsResult = await generateEssayComments({
        correctedBody,
        mode: mode as EssayMode,
        prompt,
        text,
      });

      await commentsResult.match({
        err: async () => {},
        ok: async ({ comments }) => {
          const commentTxs = buildCommentTransactions(essayId, comments, userId);
          if (commentTxs.length === 0) {
            return;
          }

          try {
            await db.transact(commentTxs);
          } catch {
            //? 本文は保存済み。コメントのみ失敗は致命的ではない
          }
        },
      });

      return { ok: true } as const;
    },
  });
}

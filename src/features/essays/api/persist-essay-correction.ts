import { id, type InstaQLEntity } from "@instantdb/react";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { correctEssayBody, generateEssayComments } from "~/features/essays/api/correct-essay";
import type { CorrectionComment } from "~/features/essays/api/mock-ai";

type EssayEntity = InstaQLEntity<AppSchema, "essays">;

type PersistEssayCorrectionParams = Pick<EssayEntity, "mode" | "prompt"> & {
  essayId: EssayEntity["id"];
  text: EssayEntity["bodyBefore"];
  userId?: InstaQLEntity<AppSchema, "diffComments">["userId"];
};

function buildCommentTransactions(
  essayId: EssayEntity["id"],
  comments: CorrectionComment[],
  userId?: InstaQLEntity<AppSchema, "diffComments">["userId"],
) {
  const now = new Date();
  const authorId = userId ?? crypto.randomUUID();

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
          userId: authorId,
        })
        .link({ essay: essayId }),
    ];
  });
}

/**
 * 添削を2段階で永続化する。
 * 1. 添削後本文を先に保存して diff を早く表示可能にする
 * 2. AI コメントはバッチ 1 回で保存する
 */
export function persistEssayCorrection({
  essayId,
  mode,
  prompt,
  text,
  userId,
}: PersistEssayCorrectionParams) {
  void (async () => {
    const bodyResult = await correctEssayBody({ mode, prompt, text });

    await bodyResult.match({
      err: () => {},
      ok: async ({ correctedBody }) => {
        const txUpdate = db.tx.essays[essayId];
        if (!txUpdate) {
          return;
        }

        await db.transact(
          txUpdate.update({
            bodyAfter: correctedBody,
            status: "reviewed",
            updatedAt: new Date(),
          }),
        );

        const commentsResult = await generateEssayComments({
          correctedBody,
          mode,
          prompt,
          text,
        });

        await commentsResult.match({
          err: () => {},
          ok: async ({ comments }) => {
            const commentTxs = buildCommentTransactions(essayId, comments, userId);
            if (commentTxs.length === 0) {
              return;
            }

            await db.transact(commentTxs);
          },
        });
      },
    });
  })();
}

import { id, type InstaQLEntity } from "@instantdb/react";
import { Result } from "better-result";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { correctEssayBody, generateEssayComments } from "~/features/essays/api/correct-essay";
import type { DiffCommentInput, EssayMode } from "~/features/essays/schemas/essay-schema";
import { EssayPersistenceError } from "~/features/essays/types/essay-error";

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
  //! 添削後本文の生成と保存は失敗時の後始末が共通なので Result.gen で短絡合成する
  const correctionResult = await Result.gen(async function* () {
    const { correctedBody } = yield* Result.await(
      correctEssayBody({ mode: mode as EssayMode, prompt, text }),
    );

    const txUpdate = db.tx.essays[essayId];
    if (!txUpdate) {
      return Result.err(new EssayPersistenceError({ message: "エッセイの更新に失敗しました" }));
    }

    yield* Result.await(
      Result.tryPromise({
        catch: (e) =>
          new EssayPersistenceError({
            cause: e,
            message: e instanceof Error ? e.message : "添削結果の保存に失敗しました",
          }),
        try: () =>
          db.transact(
            txUpdate.update({
              bodyAfter: correctedBody,
              updatedAt: new Date(),
            }),
          ),
      }),
    );

    return Result.ok(correctedBody);
  });

  if (Result.isError(correctionResult)) {
    await markCorrectionFailed(essayId);

    return { error: correctionResult.error.message || "添削に失敗しました", ok: false as const };
  }

  //? コメント生成・保存は best-effort。失敗しても本文は保存済みのため成功扱い
  const commentsResult = await generateEssayComments({
    correctedBody: correctionResult.value,
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

      //? 本文は保存済み。コメントのみ失敗は致命的ではないため結果は無視する
      await Result.tryPromise(() => db.transact(commentTxs));
    },
  });

  //? コメント処理が完了してから reviewed にする（添削結果ボタンを早く有効化しない）
  const txFinalize = db.tx.essays[essayId];
  if (!txFinalize) {
    await markCorrectionFailed(essayId);

    return { error: "添削結果の確定に失敗しました", ok: false as const };
  }

  const finalizeResult = await Result.tryPromise({
    catch: (e) =>
      new EssayPersistenceError({
        cause: e,
        message: e instanceof Error ? e.message : "添削結果の確定に失敗しました",
      }),
    try: () => db.transact(txFinalize.update({ status: "reviewed", updatedAt: new Date() })),
  });

  if (Result.isError(finalizeResult)) {
    //? reviewed 化失敗で status が scoring のまま残ると「添削結果を確認」が永久に無効化されるため、
    //? 復帰可能な correction_failed に倒して採点画面の再試行 UI を出す
    await markCorrectionFailed(essayId);

    return { error: finalizeResult.error.message, ok: false as const };
  }

  return { ok: true } as const;
}

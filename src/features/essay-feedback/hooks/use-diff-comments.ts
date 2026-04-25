import { id, type InstaQLEntity } from "@instantdb/react";
import * as v from "valibot";

import type { DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";
import { db } from "~/lib/instant";
import type { AppSchema } from "~/lib/instant-schema";

export function useDiffComments(essayId: InstaQLEntity<AppSchema, "essays">["id"]) {
  const { data, error, isLoading } = db.useQuery({
    diffComments: {
      $: {
        where: { "essay.id": essayId },
      },
    },
  });

  const addComment = async (input: DiffCommentInput, author: "ai" | "user" = "user") => {
    const commentId = id();
    const txChunk = db.tx.diffComments[commentId];
    if (txChunk == null) return;
    await db.transact(
      txChunk
        .update({
          author,
          body: input.body,
          createdAt: new Date(),
          lineNumber: input.lineNumber,
          side: input.side,
          suggestion: input.suggestion,
        })
        .link({ essay: essayId }),
    );
  };

  const bodySchema = v.pipe(v.string(), v.minLength(1, "コメントを入力してください"));

  const removeUserComment = async (commentId: InstaQLEntity<AppSchema, "diffComments">["id"]) => {
    const txChunk = db.tx.diffComments[commentId];
    if (txChunk == null) return;
    await db.transact(txChunk.delete());
  };

  const updateUserComment = async (
    commentId: InstaQLEntity<AppSchema, "diffComments">["id"],
    newBody: InstaQLEntity<AppSchema, "diffComments">["body"],
  ) => {
    const parsed = v.safeParse(bodySchema, newBody);
    if (!parsed.success) {
      return;
    }
    const txChunk = db.tx.diffComments[commentId];
    if (txChunk == null) return;
    await db.transact(
      txChunk.update({
        body: parsed.output,
        updatedAt: new Date(),
      }),
    );
  };

  return {
    addComment,
    comments:
      data?.diffComments.map((comment) => ({
        ...comment,
        author: comment.author as "ai" | "user",
        createdAt: new Date(comment.createdAt),
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
        side: comment.side as "additions" | "deletions",
      })) ?? [],
    error,
    isLoading,
    removeUserComment,
    updateUserComment,
  } as const;
}

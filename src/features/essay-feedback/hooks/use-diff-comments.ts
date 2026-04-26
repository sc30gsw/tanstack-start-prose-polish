import { id, type InstaQLEntity } from "@instantdb/react";
import { useTransition } from "react";
import * as v from "valibot";

import {
  diffCommentInputSchema,
  type DiffCommentInput,
} from "~/features/essay-feedback/schemas/essay-schema";
import { db } from "~/lib/instant";
import type { AppSchema } from "~/lib/instant-schema";

export function useDiffComments(essayId: InstaQLEntity<AppSchema, "essays">["id"]) {
  const [isPending, startTransition] = useTransition();

  const { data, error, isLoading } = db.useQuery({
    diffComments: {
      $: {
        where: { "essay.id": essayId },
      },
    },
  });

  const addUserComment = (input: DiffCommentInput, userId: string) => {
    startTransition(async () => {
      const commentId = id();
      const txChunk = db.tx.diffComments[commentId];

      if (!txChunk) {
        return;
      }

      await db.transact(
        txChunk
          .update({
            body: input.body,
            createdAt: new Date(),
            kind: "user",
            lineNumber: input.lineNumber,
            side: input.side,
            suggestion: input.suggestion,
            userId,
          })
          .link({ essay: essayId }),
      );
    });
  };

  const addAiComment = (input: DiffCommentInput) => {
    startTransition(async () => {
      const commentId = id();
      const txChunk = db.tx.diffComments[commentId];

      if (!txChunk) {
        return;
      }

      await db.transact(
        txChunk
          .update({
            body: input.body,
            createdAt: new Date(),
            kind: "ai",
            lineNumber: input.lineNumber,
            side: input.side,
            suggestion: input.suggestion,
            userId: crypto.randomUUID(),
          })
          .link({ essay: essayId }),
      );
    });
  };

  const removeUserComment = (commentId: InstaQLEntity<AppSchema, "diffComments">["id"]) => {
    startTransition(async () => {
      const txChunk = db.tx.diffComments[commentId];

      if (!txChunk) {
        return;
      }

      await db.transact(txChunk.delete());
    });
  };

  const updateUserComment = (
    commentId: InstaQLEntity<AppSchema, "diffComments">["id"],
    newBody: InstaQLEntity<AppSchema, "diffComments">["body"],
  ) => {
    const parsed = v.safeParse(v.pick(diffCommentInputSchema, ["body"]), { body: newBody });

    if (!parsed.success) {
      return;
    }

    startTransition(async () => {
      const txChunk = db.tx.diffComments[commentId];

      if (!txChunk) {
        return;
      }

      await db.transact(
        txChunk.update({
          body: parsed.output.body,
          updatedAt: new Date(),
        }),
      );
    });
  };

  return {
    isPending,
    addAiComment,
    addUserComment,
    comments:
      data?.diffComments.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        kind: comment.kind as "ai" | "user",
        side: comment.side as "additions" | "deletions",
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
      })) ?? [],
    error,
    isLoading,
    removeUserComment,
    updateUserComment,
  } as const;
}

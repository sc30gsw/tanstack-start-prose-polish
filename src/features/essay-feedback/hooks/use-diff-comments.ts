import { id, type InstaQLEntity } from "@instantdb/react";
import { useTransition } from "react";
import * as v from "valibot";

import {
  diffCommentInputSchema,
  type DiffComment,
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

  const addComment = (input: DiffCommentInput, author: DiffComment["author"] = "user") => {
    startTransition(async () => {
      const commentId = id();
      const txChunk = db.tx.diffComments[commentId];

      if (!txChunk) {
        return;
      }

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
    const parsed = v.safeParse(v.pick(diffCommentInputSchema, ["body"]), newBody);

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

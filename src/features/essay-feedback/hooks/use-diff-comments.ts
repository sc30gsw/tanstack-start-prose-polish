import { id } from "@instantdb/react";

import type { DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";
import { db } from "~/lib/instant";

export function useDiffComments(essayId: string) {
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

  return {
    addComment,
    comments: data?.diffComments ?? [],
    error: error as Error | null,
    isLoading,
  };
}

import { Paper, Stack } from "@mantine/core";
import type { DiffLineAnnotation } from "@pierre/diffs";

import { AiCommentBadge } from "~/features/essays/components/diff/ai-comment-badge";
import { DiffCommentForm } from "~/features/essays/components/diff/diff-comment-form";
import { DiffCommentThread } from "~/features/essays/components/diff/diff-comment-thread";
import type { useDiffComments } from "~/features/essays/hooks/diff/use-diff-comments";
import type { useDiffViewState } from "~/features/essays/hooks/diff/use-diff-view-state";
import type { DiffCommentInput } from "~/features/essays/schemas/essay-schema";

export type CommentAnnotationMeta =
  | (Record<"aiComments" | "userComments", ReturnType<typeof useDiffComments>["comments"]> &
      Record<"type", "thread">)
  | Record<"type", "new-comment">;

type PendingFormProps = Pick<DiffAnnotationRowProps, "isPending"> & {
  lineNumber: Parameters<DiffAnnotationRowProps["onOpenAiLineModal"]>[0];
  onClose: DiffAnnotationRowProps["onClosePendingComment"];
  onSubmit: ReturnType<typeof useDiffComments>["addUserComment"];
  side: DiffCommentInput["side"];
};

function PendingForm({ lineNumber, onClose, onSubmit, side, isPending }: PendingFormProps) {
  return (
    <Paper shadow="xs" withBorder>
      <DiffCommentForm
        lineNumber={lineNumber}
        onClose={onClose}
        onSubmit={onSubmit}
        side={side}
        isPending={isPending}
      />
    </Paper>
  );
}

type DiffAnnotationRowProps = {
  annotation: DiffLineAnnotation<CommentAnnotationMeta>;
  onAddComment: ReturnType<typeof useDiffComments>["addUserComment"];
  onClosePendingComment: () => void;
  onDeleteUserComment: ReturnType<typeof useDiffComments>["removeUserComment"];
  onOpenAiLineModal: (
    lineNumber: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["lineNumber"],
    side: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["side"],
  ) => void;
  onUpdateUserComment: ReturnType<typeof useDiffComments>["updateUserComment"];
  pendingComment: Pick<DiffCommentInput, "lineNumber" | "side"> | null;
  isPending: ReturnType<typeof useDiffComments>["isPending"];
};

export function DiffAnnotationRow({
  annotation,
  onAddComment,
  onClosePendingComment,
  onDeleteUserComment,
  onOpenAiLineModal,
  onUpdateUserComment,
  pendingComment,
  isPending,
}: DiffAnnotationRowProps) {
  if (!annotation.metadata) {
    return null;
  }

  if (annotation.metadata.type === "new-comment") {
    return (
      <PendingForm
        lineNumber={annotation.lineNumber}
        onClose={onClosePendingComment}
        onSubmit={onAddComment}
        side={annotation.side}
        isPending={isPending}
      />
    );
  }

  return (
    <Stack gap="xs" p="xs">
      {annotation.metadata.aiComments.map((comment) => (
        <AiCommentBadge
          key={comment.id}
          body={comment.body}
          onOpenDetail={() => onOpenAiLineModal(annotation.lineNumber, annotation.side)}
          suggestion={comment.suggestion}
        />
      ))}
      <DiffCommentThread
        comments={annotation.metadata.userComments}
        onDeleteUserComment={onDeleteUserComment}
        onUpdateUserComment={onUpdateUserComment}
        isPending={isPending}
      />
      {pendingComment?.lineNumber === annotation.lineNumber && (
        <PendingForm
          lineNumber={annotation.lineNumber}
          onClose={onClosePendingComment}
          onSubmit={onAddComment}
          side={annotation.side}
          isPending={isPending}
        />
      )}
    </Stack>
  );
}

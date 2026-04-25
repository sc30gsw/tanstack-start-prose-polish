import { Paper, Stack } from "@mantine/core";
import type { DiffLineAnnotation } from "@pierre/diffs";

import { AiCommentBadge } from "~/features/essay-feedback/components/ai-comment-badge";
import { DiffCommentForm } from "~/features/essay-feedback/components/diff-comment-form";
import { DiffCommentThread } from "~/features/essay-feedback/components/diff-comment-thread";
import type { DiffComment, DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";

export type CommentAnnotationMeta =
  | { aiComments: DiffComment[]; type: "thread"; userComments: DiffComment[] }
  | { type: "new-comment" };

type DiffAnnotationRowProps = {
  annotation: DiffLineAnnotation<CommentAnnotationMeta>;
  onAddComment: (input: DiffCommentInput) => Promise<void>;
  onClosePendingComment: () => void;
  onDeleteUserComment: (id: string) => Promise<void>;
  onOpenAiLineModal: (lineNumber: number, side: DiffCommentInput["side"]) => void;
  onUpdateUserComment: (id: string, body: string) => Promise<void>;
  pendingComment: Pick<DiffCommentInput, "lineNumber" | "side"> | null;
  readonly: boolean;
};

function PendingForm({
  lineNumber,
  onClose,
  onSubmit,
  side,
}: {
  lineNumber: number;
  onClose: () => void;
  onSubmit: (input: DiffCommentInput) => Promise<void>;
  side: DiffCommentInput["side"];
}) {
  return (
    <Paper shadow="xs" withBorder>
      <DiffCommentForm lineNumber={lineNumber} onClose={onClose} onSubmit={onSubmit} side={side} />
    </Paper>
  );
}

export function DiffAnnotationRow({
  annotation,
  onAddComment,
  onClosePendingComment,
  onDeleteUserComment,
  onOpenAiLineModal,
  onUpdateUserComment,
  pendingComment,
  readonly,
}: DiffAnnotationRowProps) {
  const { metadata } = annotation;
  if (metadata == null) return null;

  if (metadata.type === "new-comment") {
    return (
      <PendingForm
        lineNumber={annotation.lineNumber}
        onClose={onClosePendingComment}
        onSubmit={onAddComment}
        side={annotation.side}
      />
    );
  }

  return (
    <Stack gap="xs" p="xs">
      {metadata.aiComments.map((c) => (
        <AiCommentBadge
          key={c.id}
          body={c.body}
          onOpenDetail={() => onOpenAiLineModal(annotation.lineNumber, annotation.side)}
          suggestion={c.suggestion}
        />
      ))}
      <DiffCommentThread
        comments={metadata.userComments}
        onDeleteUserComment={onDeleteUserComment}
        onUpdateUserComment={onUpdateUserComment}
      />
      {!readonly && pendingComment?.lineNumber === annotation.lineNumber && (
        <PendingForm
          lineNumber={annotation.lineNumber}
          onClose={onClosePendingComment}
          onSubmit={onAddComment}
          side={annotation.side}
        />
      )}
    </Stack>
  );
}

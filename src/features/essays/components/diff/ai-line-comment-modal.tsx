import { Stack, Text } from "@mantine/core";

import { AiCommentBadge } from "~/features/essays/components/diff/ai-comment-badge";
import { DiffCommentForm } from "~/features/essays/components/diff/diff-comment-form";
import { DiffCommentThread } from "~/features/essays/components/diff/diff-comment-thread";
import type { useDiffComments } from "~/features/essays/hooks/diff/use-diff-comments";
import type { useDiffViewState } from "~/features/essays/hooks/diff/use-diff-view-state";

type AiLineCommentModalBodyProps = {
  comments: ReturnType<typeof useDiffComments>["comments"];
  lineNumber: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["lineNumber"];
  onAddComment: ReturnType<typeof useDiffComments>["addUserComment"];
  onCloseModal: () => void;
  onDeleteUserComment?: ReturnType<typeof useDiffComments>["removeUserComment"];
  onUpdateUserComment?: ReturnType<typeof useDiffComments>["updateUserComment"];
  showCommentForm: boolean;
  side: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["side"];
  isPending: ReturnType<typeof useDiffComments>["isPending"];
};

export function AiLineCommentModalBody({
  comments,
  lineNumber,
  onAddComment,
  onCloseModal,
  onDeleteUserComment,
  onUpdateUserComment,
  showCommentForm,
  side,
  isPending,
}: AiLineCommentModalBodyProps) {
  const forLine = comments.filter((c) => c.lineNumber === lineNumber && c.side === side);
  const aiComments = forLine.filter((c) => c.kind === "ai");
  const userComments = forLine.filter((c) => c.kind === "user");

  return (
    <Stack gap="md">
      {aiComments.length === 0 && userComments.length === 0 ? (
        <Text c="dimmed" size="sm">
          この行の AI 指摘はありません。
        </Text>
      ) : (
        <>
          {aiComments.map((comment) => (
            <AiCommentBadge key={comment.id} body={comment.body} suggestion={comment.suggestion} />
          ))}
          <Text c="dimmed" size="xs">
            差分上で追加するには行をクリックするか、行末の（＋）を使ってください。
          </Text>
          <DiffCommentThread
            comments={userComments}
            onDeleteUserComment={onDeleteUserComment ?? undefined}
            onUpdateUserComment={onUpdateUserComment ?? undefined}
            isPending={isPending}
          />
          {showCommentForm ? (
            <DiffCommentForm
              closeAfterSubmit={false}
              lineNumber={lineNumber}
              onClose={onCloseModal}
              onSubmit={onAddComment}
              side={side}
              isPending={isPending}
            />
          ) : null}
        </>
      )}
    </Stack>
  );
}

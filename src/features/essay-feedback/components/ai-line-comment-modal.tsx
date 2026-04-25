import { Stack, Text } from "@mantine/core";

import { AiCommentBadge } from "~/features/essay-feedback/components/ai-comment-badge";
import { DiffCommentForm } from "~/features/essay-feedback/components/diff-comment-form";
import { DiffCommentThread } from "~/features/essay-feedback/components/diff-comment-thread";
import type { DiffComment, DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";

export type AiLineCommentModalBodyProps = {
  comments: DiffComment[];
  lineNumber: number;
  onAddComment: (input: DiffCommentInput) => Promise<void>;
  onCloseModal: () => void;
  onDeleteUserComment?: (commentId: string) => Promise<void>;
  onUpdateUserComment?: (commentId: string, body: string) => Promise<void>;
  showCommentForm: boolean;
  side: "additions" | "deletions";
};

/** AI 指摘の確認。親から `comments` を都度渡す（InstantDB 等の更新に追従）。 */
export function AiLineCommentModalBody({
  comments,
  lineNumber,
  onAddComment,
  onCloseModal,
  onDeleteUserComment,
  onUpdateUserComment,
  showCommentForm,
  side,
}: AiLineCommentModalBodyProps) {
  const forLine = comments.filter((c) => c.lineNumber === lineNumber && c.side === side);
  const ai = forLine.filter((c) => c.author === "ai");
  const user = forLine.filter((c) => c.author === "user");

  return (
    <Stack gap="md">
      {ai.length === 0 && user.length === 0 ? (
        <Text c="dimmed" size="sm">
          この行の AI 指摘はありません。
        </Text>
      ) : (
        <>
          {ai.map((c) => (
            <AiCommentBadge key={c.id} body={c.body} suggestion={c.suggestion} />
          ))}
          <Text c="dimmed" size="xs">
            差分上で追加するには行をクリックするか、行末の（＋）を使ってください。
          </Text>
          <DiffCommentThread
            comments={user}
            onDeleteUserComment={onDeleteUserComment ?? undefined}
            onUpdateUserComment={onUpdateUserComment ?? undefined}
          />
          {showCommentForm ? (
            <DiffCommentForm
              closeAfterSubmit={false}
              lineNumber={lineNumber}
              onClose={onCloseModal}
              onSubmit={onAddComment}
              side={side}
            />
          ) : null}
        </>
      )}
    </Stack>
  );
}

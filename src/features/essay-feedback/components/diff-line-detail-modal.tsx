import { Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

import { AiCommentBadge } from "~/features/essay-feedback/components/ai-comment-badge";
import { DiffCommentForm } from "~/features/essay-feedback/components/diff-comment-form";
import { DiffCommentThread } from "~/features/essay-feedback/components/diff-comment-thread";
import type { DiffComment, DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";

type OpenDiffLineDetailModalParams = {
  comments: DiffComment[];
  lineNumber: number;
  onAddComment: (input: DiffCommentInput) => Promise<void>;
  readonly: boolean;
  side: "additions" | "deletions";
};

export function openDiffLineDetailModal({
  comments,
  lineNumber,
  onAddComment,
  readonly,
  side,
}: OpenDiffLineDetailModalParams) {
  const forLine = comments.filter((c) => c.lineNumber === lineNumber && c.side === side);
  const ai = forLine.filter((c) => c.author === "ai");
  const user = forLine.filter((c) => c.author === "user");
  const sideLabel = side === "additions" ? "添削後" : "添削前";

  modals.open({
    children: (
      <Stack gap="md">
        {ai.length === 0 && user.length === 0 ? (
          <Text c="dimmed" size="sm">
            この行に保存された指摘はありません。{readonly ? null : "下からコメントを追加できます。"}
          </Text>
        ) : null}
        {ai.map((c) => (
          <AiCommentBadge key={c.id} body={c.body} suggestion={c.suggestion} />
        ))}
        <DiffCommentThread comments={user} />
        {readonly ? null : (
          <DiffCommentForm
            lineNumber={lineNumber}
            onClose={() => modals.closeAll()}
            onSubmit={async (input) => {
              await onAddComment(input);
              modals.closeAll();
            }}
            side={side}
          />
        )}
      </Stack>
    ),
    size: "lg",
    title: `行 ${lineNumber}（${sideLabel}）の指摘・コメント`,
  });
}

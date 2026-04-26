import type { InstaQLEntity } from "@instantdb/react";
import { Box, Group, Paper, Stack, Text } from "@mantine/core";

import { AiCommentBadge } from "~/features/essay-feedback/components/ai-comment-badge";
import { DiffCommentThread } from "~/features/essay-feedback/components/diff-comment-thread";
import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import type { useDiffViewState } from "~/features/essay-feedback/hooks/use-diff-view-state";
import type { AppSchema } from "~/lib/instant-schema";

type DiffNoHunksViewProps = {
  afterText: InstaQLEntity<AppSchema, "essays">["bodyAfter"];
  beforeText: InstaQLEntity<AppSchema, "essays">["bodyBefore"];
  comments: ReturnType<typeof useDiffComments>["comments"];
  diffStyle: "split" | "unified";
  onDeleteUserComment: ReturnType<typeof useDiffComments>["removeUserComment"];
  onOpenAiLineModal: (
    lineNumber: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["lineNumber"],
    side: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["side"],
  ) => void;
  onUpdateUserComment: ReturnType<typeof useDiffComments>["updateUserComment"];
};

export function DiffNoHunksView({
  afterText,
  beforeText,
  comments,
  diffStyle,
  onDeleteUserComment,
  onOpenAiLineModal,
  onUpdateUserComment,
}: DiffNoHunksViewProps) {
  return (
    <Box className="diff-view-root border-default-border overflow-hidden rounded-md border">
      <Stack gap="md" p="md">
        <Text c="dimmed" size="sm">
          行単位の差分はありません（前後のテキストが同一の可能性があります）。添削前後の全文を並べて表示します。
        </Text>
        {diffStyle === "unified" ? (
          <Stack gap="md">
            <div>
              <Text fw={600} size="xs">
                添削前
              </Text>
              <Text className="wrap-break-word whitespace-pre-wrap" component="pre" size="sm">
                {beforeText}
              </Text>
            </div>
            <div>
              <Text fw={600} size="xs">
                添削後
              </Text>
              <Text className="wrap-break-word whitespace-pre-wrap" component="pre" size="sm">
                {afterText}
              </Text>
            </div>
          </Stack>
        ) : (
          <Group align="flex-start" grow wrap="wrap">
            <Paper p="md" withBorder>
              <Text fw={600} mb="xs" size="xs">
                添削前
              </Text>
              <Text className="wrap-break-word whitespace-pre-wrap" component="pre" size="sm">
                {beforeText}
              </Text>
            </Paper>
            <Paper p="md" withBorder>
              <Text fw={600} mb="xs" size="xs">
                添削後
              </Text>
              <Text className="wrap-break-word whitespace-pre-wrap" component="pre" size="sm">
                {afterText}
              </Text>
            </Paper>
          </Group>
        )}
        {comments.length > 0 ? (
          <Stack gap="sm">
            <Text fw={600} size="sm">
              コメント
            </Text>
            {comments
              .filter((c) => c.kind === "ai")
              .map((c) => (
                <AiCommentBadge
                  key={c.id}
                  body={c.body}
                  onOpenDetail={() => {
                    onOpenAiLineModal(c.lineNumber, c.side);
                  }}
                  suggestion={c.suggestion}
                />
              ))}
            <DiffCommentThread
              comments={comments.filter((c) => c.kind === "user")}
              onDeleteUserComment={onDeleteUserComment}
              onUpdateUserComment={onUpdateUserComment}
            />
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

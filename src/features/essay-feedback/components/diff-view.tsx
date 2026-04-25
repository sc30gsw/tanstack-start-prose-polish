import { ActionIcon, Box, Group, Paper, Stack, Text } from "@mantine/core";
import type {
  DiffLineAnnotation,
  GetHoveredLineResult,
  OnDiffLineClickProps,
  OnDiffLineEnterLeaveProps,
} from "@pierre/diffs";
import { parseDiffFromFile } from "@pierre/diffs";
import { FileDiff } from "@pierre/diffs/react";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { AiCommentBadge } from "~/features/essay-feedback/components/ai-comment-badge";
import { DiffCommentForm } from "~/features/essay-feedback/components/diff-comment-form";
import { openDiffLineDetailModal } from "~/features/essay-feedback/components/diff-line-detail-modal";
import { DiffCommentThread } from "~/features/essay-feedback/components/diff-comment-thread";
import type { DiffComment, DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";

type CommentAnnotationMeta =
  | { aiComments: DiffComment[]; type: "thread"; userComments: DiffComment[] }
  | { type: "new-comment" };

type PendingComment = {
  lineNumber: number;
  side: "additions" | "deletions";
};

type DiffViewProps = {
  afterText: string;
  beforeText: string;
  comments: DiffComment[];
  diffStyle?: "split" | "unified";
  onAddComment: (input: DiffCommentInput) => Promise<void>;
  readonly?: boolean;
};

export function DiffView({
  beforeText,
  afterText,
  comments,
  diffStyle = "split",
  onAddComment,
  readonly = false,
}: DiffViewProps) {
  const [pendingComment, setPendingComment] = useState<null | PendingComment>(null);
  const [lineHoverPreview, setLineHoverPreview] = useState<null | { left: number; text: string; top: number }>(
    null,
  );

  const fileDiff = useMemo(
    () =>
      parseDiffFromFile(
        { contents: beforeText, name: "essay.txt" },
        { contents: afterText, name: "essay.txt" },
      ),
    [afterText, beforeText],
  );

  const isChangeLine = (lineType: OnDiffLineClickProps["lineType"]) =>
    lineType === "change-addition" || lineType === "change-deletion";

  const handleDiffLineClick = useCallback(
    (props: OnDiffLineClickProps) => {
      if (props.type !== "diff-line" || !isChangeLine(props.lineType)) return;
      openDiffLineDetailModal({
        comments,
        lineNumber: props.lineNumber,
        onAddComment,
        readonly,
        side: props.annotationSide,
      });
    },
    [comments, onAddComment, readonly],
  );

  const handleDiffLineEnter = useCallback(
    (props: OnDiffLineEnterLeaveProps) => {
      if (props.type !== "diff-line" || !isChangeLine(props.lineType)) {
        setLineHoverPreview(null);
        return;
      }
      const side = props.annotationSide;
      const { lineNumber } = props;
      const ai = comments.filter(
        (c) => c.lineNumber === lineNumber && c.side === side && c.author === "ai",
      );
      if (ai.length === 0) {
        setLineHoverPreview(null);
        return;
      }
      const text = ai
        .map((c) => {
          const sug = c.suggestion != null ? ` — ${c.suggestion}` : "";
          return `${c.body}${sug}`;
        })
        .join(" ");
      const rect = props.lineElement.getBoundingClientRect();
      setLineHoverPreview({
        left: Math.min(rect.left, globalThis.innerWidth - 340),
        text,
        top: rect.bottom + 6,
      });
    },
    [comments],
  );

  const handleDiffLineLeave = useCallback(() => {
    setLineHoverPreview(null);
  }, []);

  const diffOptions = useMemo(
    () => ({
      /** GitHub の unified diff に近い行頭の + / - 表示 */
      diffIndicators: "classic" as const,
      diffStyle,
      /** 行ホバー時のガター（＋）を有効化 — renderGutterUtility 単体では false のまま */
      enableGutterUtility: !readonly,
      lineDiffType: "word-alt" as const,
      lineHoverHighlight: "line" as const,
      onLineClick: handleDiffLineClick,
      onLineEnter: handleDiffLineEnter,
      onLineLeave: handleDiffLineLeave,
      overflow: "scroll" as const,
      /** Shiki の GitHub 系テーマ（pierre 既定より GitHub.com に近い配色） */
      theme: { dark: "github-dark" as const, light: "github-light" as const },
      themeType: "light" as const,
    }),
    [diffStyle, handleDiffLineClick, handleDiffLineEnter, handleDiffLineLeave, readonly],
  );

  const hasRenderableHunks = fileDiff.hunks.length > 0;

  const lineAnnotations = useMemo((): DiffLineAnnotation<CommentAnnotationMeta>[] => {
    const lineCommentMap: Map<string, { ai: DiffComment[]; user: DiffComment[] }> = new Map();

    for (const comment of comments) {
      const key = `${comment.side}:${comment.lineNumber}`;
      const existing = lineCommentMap.get(key) ?? { ai: [], user: [] };
      if (comment.author === "ai") {
        existing.ai.push(comment);
      } else {
        existing.user.push(comment);
      }
      lineCommentMap.set(key, existing);
    }

    const annotations: DiffLineAnnotation<CommentAnnotationMeta>[] = [];

    for (const [key, { ai: aiComments, user: userComments }] of lineCommentMap.entries()) {
      const [side, lineStr] = key.split(":");
      if (side == null || lineStr == null) continue;
      const lineNumber = Number.parseInt(lineStr, 10);
      if (Number.isNaN(lineNumber)) continue;

      annotations.push({
        lineNumber,
        metadata: {
          aiComments,
          type: "thread",
          userComments,
        },
        side: side as "additions" | "deletions",
      });
    }

    if (pendingComment != null) {
      const alreadyHasAnnotation = annotations.some(
        (a) => a.side === pendingComment.side && a.lineNumber === pendingComment.lineNumber,
      );
      if (!alreadyHasAnnotation) {
        annotations.push({
          lineNumber: pendingComment.lineNumber,
          metadata: { type: "new-comment" },
          side: pendingComment.side,
        });
      }
    }

    return annotations;
  }, [comments, pendingComment]);

  const renderAnnotation = (annotation: DiffLineAnnotation<CommentAnnotationMeta>) => {
    const { metadata } = annotation;
    if (metadata == null) return null;

    if (metadata.type === "new-comment") {
      return (
        <Paper shadow="xs" withBorder>
          <DiffCommentForm
            lineNumber={annotation.lineNumber}
            onClose={() => setPendingComment(null)}
            onSubmit={onAddComment}
            side={annotation.side as "additions" | "deletions"}
          />
        </Paper>
      );
    }

    return (
      <Stack gap="xs" p="xs">
        {metadata.aiComments.map((c) => (
          <AiCommentBadge key={c.id} body={c.body} suggestion={c.suggestion} />
        ))}
        <DiffCommentThread comments={metadata.userComments} />
        {!readonly && pendingComment?.lineNumber === annotation.lineNumber && (
          <Paper shadow="xs" withBorder>
            <DiffCommentForm
              lineNumber={annotation.lineNumber}
              onClose={() => setPendingComment(null)}
              onSubmit={onAddComment}
              side={annotation.side as "additions" | "deletions"}
            />
          </Paper>
        )}
      </Stack>
    );
  };

  const renderGutterUtility = (getHoveredLine: () => GetHoveredLineResult<"diff"> | undefined) => {
    if (readonly) return null;

    return (
      <Box
        onClick={() => {
          const hovered = getHoveredLine();
          if (hovered == null) return;
          setPendingComment({
            lineNumber: hovered.lineNumber,
            side: hovered.side as "additions" | "deletions",
          });
        }}
      >
        <ActionIcon
          aria-label="行にコメントを追加"
          color="blue"
          radius="xl"
          size="sm"
          title="コメントを追加"
          variant="light"
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Box>
    );
  };

  const preStyles = { wordBreak: "break-word" as const, whiteSpace: "pre-wrap" as const };

  if (!hasRenderableHunks) {
    return (
      <Box
        className="diff-view-root"
        style={{
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
        }}
      >
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
                <Text component="pre" size="sm" style={preStyles}>
                  {beforeText}
                </Text>
              </div>
              <div>
                <Text fw={600} size="xs">
                  添削後
                </Text>
                <Text component="pre" size="sm" style={preStyles}>
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
                <Text component="pre" size="sm" style={preStyles}>
                  {beforeText}
                </Text>
              </Paper>
              <Paper p="md" withBorder>
                <Text fw={600} mb="xs" size="xs">
                  添削後
                </Text>
                <Text component="pre" size="sm" style={preStyles}>
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
                .filter((c) => c.author === "ai")
                .map((c) => (
                  <AiCommentBadge key={c.id} body={c.body} suggestion={c.suggestion} />
                ))}
              <DiffCommentThread comments={comments.filter((c) => c.author === "user")} />
            </Stack>
          ) : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      className="diff-view-root"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
      }}
    >
      <FileDiff
        className="diff-view-file-diff"
        disableWorkerPool
        fileDiff={fileDiff}
        lineAnnotations={lineAnnotations}
        options={diffOptions}
        renderAnnotation={renderAnnotation}
        renderGutterUtility={!readonly ? renderGutterUtility : undefined}
        renderHeaderMetadata={
          diffStyle === "split"
            ? () => (
                <Text c="dimmed" size="xs">
                  左: 添削前 / 右: 添削後
                </Text>
              )
            : undefined
        }
        style={{ minHeight: 360 }}
      />
      {lineHoverPreview != null &&
        typeof document !== "undefined" &&
        createPortal(
          <Paper
            p="xs"
            shadow="md"
            style={{
              left: lineHoverPreview.left,
              maxWidth: 320,
              pointerEvents: "none",
              position: "fixed",
              top: lineHoverPreview.top,
              zIndex: 400,
            }}
            withBorder
          >
            <Text size="xs">{lineHoverPreview.text}</Text>
          </Paper>,
          document.body,
        )}
    </Box>
  );
}

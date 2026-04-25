import {
  ActionIcon,
  Box,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  useComputedColorScheme,
} from "@mantine/core";
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
import { AiLineCommentModalBody } from "~/features/essay-feedback/components/ai-line-comment-modal";
import { DiffCommentForm } from "~/features/essay-feedback/components/diff-comment-form";
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
  onDeleteUserComment?: (commentId: string) => Promise<void>;
  onUpdateUserComment?: (commentId: string, body: string) => Promise<void>;
  /** 差分上の＋・行クリック・インライン。既定 false。 */
  readonly?: boolean;
  /**
   * AI 指摘モーダル内の新規コメント。未指定は `!readonly`（履歴は readonly でも `true` にできる）。
   */
  showAiModalCommentForm?: boolean;
};

export function DiffView({
  beforeText,
  afterText,
  comments,
  diffStyle = "split",
  onAddComment,
  onDeleteUserComment,
  onUpdateUserComment,
  readonly = false,
  showAiModalCommentForm: showAiModalCommentFormProp,
}: DiffViewProps) {
  const showAiModalCommentForm = showAiModalCommentFormProp ?? !readonly;
  const resolvedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const diffThemeType = resolvedColorScheme === "dark" ? ("dark" as const) : ("light" as const);

  const [pendingComment, setPendingComment] = useState<null | PendingComment>(null);
  const [lineHoverPreview, setLineHoverPreview] = useState<null | {
    left: number;
    text: string;
    top: number;
  }>(null);
  const [aiLineModal, setAiLineModal] = useState<null | {
    lineNumber: number;
    side: "additions" | "deletions";
  }>(null);

  const fileDiff = useMemo(
    () =>
      parseDiffFromFile(
        { contents: beforeText, name: "添削前" },
        { contents: afterText, name: "添削後" },
      ),
    [afterText, beforeText],
  );

  const isChangeLine = (lineType: OnDiffLineClickProps["lineType"]) =>
    lineType === "change-addition" || lineType === "change-deletion";

  const handleDiffLineClick = useCallback(
    (props: OnDiffLineClickProps) => {
      if (readonly) return;
      if (props.type !== "diff-line" || !isChangeLine(props.lineType)) return;
      setPendingComment({
        lineNumber: props.lineNumber,
        side: props.annotationSide as "additions" | "deletions",
      });
    },
    [readonly],
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
      /** 長文1行でも列幅に収まるよう折り返し（既定の scroll は横スクロールになりがち） */
      overflow: "wrap" as const,
      /** Shiki: Mantine の実表示（auto 含む）に追従 */
      theme: { dark: "github-dark" as const, light: "github-light" as const },
      themeType: diffThemeType,
    }),
    [
      diffStyle,
      diffThemeType,
      handleDiffLineClick,
      handleDiffLineEnter,
      handleDiffLineLeave,
      readonly,
    ],
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

    const lineSide = annotation.side as "additions" | "deletions";
    const openAiLineModal = () => {
      setAiLineModal({ lineNumber: annotation.lineNumber, side: lineSide });
    };

    return (
      <Stack gap="xs" p="xs">
        {metadata.aiComments.map((c) => (
          <AiCommentBadge
            key={c.id}
            body={c.body}
            onOpenDetail={openAiLineModal}
            suggestion={c.suggestion}
          />
        ))}
        <DiffCommentThread
          comments={metadata.userComments}
          onDeleteUserComment={onDeleteUserComment}
          onUpdateUserComment={onUpdateUserComment}
        />
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

  const rootBoxStyle = {
    border: "1px solid var(--mantine-color-default-border)",
    borderRadius: "var(--mantine-radius-md)",
    overflow: "hidden" as const,
  };

  const aiLineModalTitle =
    aiLineModal == null
      ? ""
      : `行 ${aiLineModal.lineNumber}（${aiLineModal.side === "additions" ? "添削後" : "添削前"}）の AI 指摘`;

  const aiLineModalNode = (
    <Modal
      onClose={() => {
        setAiLineModal(null);
      }}
      opened={aiLineModal != null}
      size="lg"
      title={aiLineModalTitle}
    >
      {aiLineModal != null ? (
        <AiLineCommentModalBody
          comments={comments}
          lineNumber={aiLineModal.lineNumber}
          onAddComment={onAddComment}
          onCloseModal={() => {
            setAiLineModal(null);
          }}
          onDeleteUserComment={onDeleteUserComment}
          onUpdateUserComment={onUpdateUserComment}
          showCommentForm={showAiModalCommentForm}
          side={aiLineModal.side}
        />
      ) : null}
    </Modal>
  );

  if (!hasRenderableHunks) {
    return (
      <>
        <Box className="diff-view-root" style={rootBoxStyle}>
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
                    <AiCommentBadge
                      key={c.id}
                      body={c.body}
                      onOpenDetail={() => {
                        setAiLineModal({ lineNumber: c.lineNumber, side: c.side });
                      }}
                      suggestion={c.suggestion}
                    />
                  ))}
                <DiffCommentThread
                  comments={comments.filter((c) => c.author === "user")}
                  onDeleteUserComment={onDeleteUserComment}
                  onUpdateUserComment={onUpdateUserComment}
                />
              </Stack>
            ) : null}
          </Stack>
        </Box>
        {aiLineModalNode}
      </>
    );
  }

  return (
    <>
      <Box className="diff-view-root" style={rootBoxStyle}>
        <FileDiff
          key={diffThemeType}
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
                  <Group gap={0} grow justify="stretch" wrap="nowrap" w="100%">
                    <Box
                      p="xs"
                      style={{
                        backgroundColor: "var(--mantine-color-default-hover)",
                        borderRight: "1px solid var(--mantine-color-default-border)",
                        textAlign: "center",
                      }}
                    >
                      <Text fw={600} size="sm">
                        添削前
                      </Text>
                    </Box>
                    <Box
                      p="xs"
                      style={{
                        backgroundColor: "var(--mantine-color-default-hover)",
                        textAlign: "center",
                      }}
                    >
                      <Text fw={600} size="sm">
                        添削後
                      </Text>
                    </Box>
                  </Group>
                )
              : () => (
                  <Box p="xs" w="100%">
                    <Text fw={600} size="sm" ta="center">
                      全体表示
                    </Text>
                    <Text c="dimmed" size="xs" ta="center">
                      <Text c="red" component="span" fw={600} inherit>
                        −
                      </Text>{" "}
                      削除 /{" "}
                      <Text c="green" component="span" fw={600} inherit>
                        +
                      </Text>{" "}
                      追加
                    </Text>
                  </Box>
                )
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
      {aiLineModalNode}
    </>
  );
}

import type { InstaQLEntity } from "@instantdb/react";
import {
  ActionIcon,
  Box,
  Group,
  Modal,
  Paper,
  Text,
  UnstyledButton,
  useComputedColorScheme,
} from "@mantine/core";
import type { FileDiffOptions, GetHoveredLineResult } from "@pierre/diffs";
import { parseDiffFromFile } from "@pierre/diffs";
import { FileDiff } from "@pierre/diffs/react";
import { IconPlus } from "@tabler/icons-react";
import { createPortal } from "react-dom";

import { AiLineCommentModalBody } from "~/features/essay-feedback/components/ai-line-comment-modal";
import {
  DiffAnnotationRow,
  type CommentAnnotationMeta,
} from "~/features/essay-feedback/components/diff-annotation-row";
import { DiffNoHunksView } from "~/features/essay-feedback/components/diff-no-hunks-view";
import { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import { useDiffViewState } from "~/features/essay-feedback/hooks/use-diff-view-state";
import type { AppSchema } from "~/lib/instant-schema";
import type { DiffSearchParams } from "~/routes/essays/$essayId/diff";

type DiffViewProps = {
  afterText: InstaQLEntity<AppSchema, "essays">["bodyAfter"];
  beforeText: InstaQLEntity<AppSchema, "essays">["bodyBefore"];
  diffStyle: DiffSearchParams["view"];
  essayId: InstaQLEntity<AppSchema, "essays">["id"];
  readonly?: boolean;
  showAiModalCommentForm?: boolean;
};

export function DiffView({
  beforeText,
  afterText,
  diffStyle = "split",
  essayId,
  readonly = false,
  showAiModalCommentForm: showAiModalCommentFormProp,
}: DiffViewProps) {
  const { addComment, comments, isPending, removeUserComment, updateUserComment } =
    useDiffComments(essayId);

  const showAiModalCommentForm = showAiModalCommentFormProp ?? !readonly;
  const resolvedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const diffThemeType = resolvedColorScheme === "dark" ? "dark" : "light";

  const {
    aiLineModal,
    handleDiffLineClick,
    handleDiffLineEnter,
    handleDiffLineLeave,
    lineAnnotations,
    lineHoverPreview,
    pendingComment,
    setAiLineModal,
    setPendingComment,
  } = useDiffViewState({ comments, readonly });

  const fileDiff = parseDiffFromFile(
    { contents: beforeText, name: "添削前" },
    { contents: afterText ?? "", name: "添削後" },
  );

  const diffOptions = {
    diffIndicators: "classic",
    diffStyle,
    enableGutterUtility: !readonly,
    lineDiffType: "word-alt",
    lineHoverHighlight: "line",
    onLineClick: handleDiffLineClick,
    onLineEnter: handleDiffLineEnter,
    onLineLeave: handleDiffLineLeave,
    overflow: "wrap",
    theme: { dark: "github-dark", light: "github-light" },
    themeType: diffThemeType,
  } as const satisfies FileDiffOptions<CommentAnnotationMeta>;

  const hasRenderableHunks = fileDiff.hunks.length > 0;

  const renderGutterUtility = (getHoveredLine: () => GetHoveredLineResult<"diff"> | undefined) => {
    if (readonly) {
      return null;
    }

    return (
      <UnstyledButton
        disabled={isPending}
        onClick={() => {
          const hovered = getHoveredLine();

          if (!hovered) {
            return;
          }

          setPendingComment({
            lineNumber: hovered.lineNumber,
            side: hovered.side,
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
      </UnstyledButton>
    );
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
      {aiLineModal ? (
        <AiLineCommentModalBody
          comments={comments}
          lineNumber={aiLineModal.lineNumber}
          onAddComment={addComment}
          onCloseModal={() => {
            setAiLineModal(null);
          }}
          onDeleteUserComment={removeUserComment}
          onUpdateUserComment={updateUserComment}
          showCommentForm={showAiModalCommentForm}
          side={aiLineModal.side}
          isPending={isPending}
        />
      ) : null}
    </Modal>
  );

  if (!hasRenderableHunks) {
    return (
      <>
        <DiffNoHunksView
          afterText={afterText}
          beforeText={beforeText}
          comments={comments}
          diffStyle={diffStyle}
          onDeleteUserComment={removeUserComment}
          onOpenAiLineModal={(lineNumber, side) => setAiLineModal({ lineNumber, side })}
          onUpdateUserComment={updateUserComment}
        />
        {aiLineModalNode}
      </>
    );
  }

  return (
    <>
      <Box className="diff-view-root border-default-border overflow-hidden rounded-md border">
        <FileDiff
          key={diffThemeType}
          className="diff-view-file-diff"
          disableWorkerPool
          fileDiff={fileDiff}
          lineAnnotations={lineAnnotations}
          options={diffOptions}
          renderAnnotation={(annotation) => (
            <DiffAnnotationRow
              annotation={annotation}
              onAddComment={addComment}
              onClosePendingComment={() => setPendingComment(null)}
              onDeleteUserComment={removeUserComment}
              onOpenAiLineModal={(lineNumber, side) => setAiLineModal({ lineNumber, side })}
              onUpdateUserComment={updateUserComment}
              pendingComment={pendingComment}
              readonly={readonly}
              isPending={isPending}
            />
          )}
          renderGutterUtility={!readonly ? renderGutterUtility : undefined}
          renderHeaderMetadata={
            diffStyle === "split"
              ? () => (
                  <Group gap={0} grow justify="stretch" wrap="nowrap" w="100%">
                    <Box
                      className="border-default-border bg-default-hover border-r"
                      p="xs"
                      ta="center"
                    >
                      <Text fw={600} size="sm">
                        添削前
                      </Text>
                    </Box>
                    <Box className="bg-default-hover" p="xs" ta="center">
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
        {lineHoverPreview &&
          createPortal(
            <Paper
              className="pointer-events-none fixed"
              maw={320}
              p="xs"
              shadow="md"
              style={{ left: lineHoverPreview.left, top: lineHoverPreview.top, zIndex: 400 }}
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

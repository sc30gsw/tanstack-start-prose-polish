import type { InstaQLEntity } from "@instantdb/react";
import {
  ActionIcon,
  Box,
  Group,
  Modal,
  Text,
  UnstyledButton,
  useComputedColorScheme,
} from "@mantine/core";
import type { FileDiffOptions, GetHoveredLineResult } from "@pierre/diffs";
import { parseDiffFromFile } from "@pierre/diffs";
import { FileDiff } from "@pierre/diffs/react";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";

import { AiLineCommentModalBody } from "~/features/essay-feedback/components/ai-line-comment-modal";
import {
  DiffAnnotationRow,
  type CommentAnnotationMeta,
} from "~/features/essay-feedback/components/diff-annotation-row";
import { DiffNoHunksView } from "~/features/essay-feedback/components/diff-no-hunks-view";
import { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import { useDiffViewState } from "~/features/essay-feedback/hooks/use-diff-view-state";
import type { DiffSearchParams } from "~/features/essay-feedback/schemas/search-params/essay-diff-search-params";
import type { AppSchema } from "~/lib/instant-schema";

type DiffViewProps = {
  afterText: InstaQLEntity<AppSchema, "essays">["bodyAfter"];
  beforeText: InstaQLEntity<AppSchema, "essays">["bodyBefore"];
  diffStyle: DiffSearchParams["view"];
  essayId: InstaQLEntity<AppSchema, "essays">["id"];
  showAiModalCommentForm?: boolean;
};

export function DiffView({
  beforeText,
  afterText,
  diffStyle = "split",
  essayId,
  showAiModalCommentForm: showAiModalCommentFormProp,
}: DiffViewProps) {
  const { addComment, comments, isPending, removeUserComment, updateUserComment } =
    useDiffComments(essayId);

  const showAiModalCommentForm = showAiModalCommentFormProp ?? true;
  const resolvedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const diffThemeType = resolvedColorScheme === "dark" ? "dark" : "light";

  const {
    aiLineModal,
    handleDiffLineClick,
    lineAnnotations,
    pendingComment,
    setAiLineModal,
    setPendingComment,
  } = useDiffViewState({ comments });

  // ? React Compiler 任せにせず手動メモ化:
  // ? parseDiffFromFile の戻り値オブジェクトを <FileDiff fileDiff={...}> に渡す。
  // ? 新参照のたびに pierre/diffs が diff 全体を再パース・再描画してホバーがちらつく。
  const fileDiff = useMemo(
    () =>
      parseDiffFromFile(
        { contents: beforeText, name: "添削前" },
        { contents: afterText ?? "", name: "添削後" },
      ),
    [beforeText, afterText],
  );

  // ? React Compiler 任せにせず手動メモ化:
  // ? renderGutterUtility は <FileDiff> 経由で gutter "+" ボタン DOM の生成元になる。
  // ? 新参照のたびに pierre/diffs がボタンを作り直し、ホバー中に視覚的にちらつく。
  const renderGutterUtility = useCallback(
    (getHoveredLine: () => GetHoveredLineResult<"diff"> | undefined) => {
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
    },
    [isPending, setPendingComment],
  );

  // ? React Compiler 任せにせず手動メモ化:
  // ? renderAnnotation は <FileDiff> 経由で各注釈行の生成関数になる。
  // ? 新参照のたびに pierre/diffs が注釈行を作り直し、入力中フォームのフォーカスが飛ぶ。
  const renderAnnotation = useCallback(
    (
      annotation: Parameters<
        NonNullable<FileDiffOptions<CommentAnnotationMeta>["renderAnnotation"]>
      >[0],
    ) => (
      <DiffAnnotationRow
        annotation={annotation}
        onAddComment={addComment}
        onClosePendingComment={() => setPendingComment(null)}
        onDeleteUserComment={removeUserComment}
        onOpenAiLineModal={(lineNumber, side) => setAiLineModal({ lineNumber, side })}
        onUpdateUserComment={updateUserComment}
        pendingComment={pendingComment}
        isPending={isPending}
      />
    ),
    [
      addComment,
      removeUserComment,
      updateUserComment,
      setPendingComment,
      setAiLineModal,
      pendingComment,
      isPending,
    ],
  );

  // ? React Compiler 任せにせず手動メモ化:
  // ? <FileDiff options={...}> は内部で参照同値判定し、新参照だと gutter / hover を全再構築。
  // ? as const satisfies は型のみで参照は毎回新規になるため、useMemo で参照固定が必須。
  const diffOptions = useMemo(
    () =>
      ({
        diffIndicators: "classic",
        diffStyle,
        enableGutterUtility: true,
        lineDiffType: "word-alt",
        lineHoverHighlight: "line",
        onLineClick: handleDiffLineClick,
        overflow: "wrap",
        theme: { dark: "github-dark", light: "github-light" },
        themeType: diffThemeType,
      }) as const satisfies FileDiffOptions<CommentAnnotationMeta>,
    [diffStyle, handleDiffLineClick, diffThemeType],
  );

  const hasRenderableHunks = fileDiff.hunks.length > 0;

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
          className="diff-view-file-diff min-h-[360px]"
          disableWorkerPool
          fileDiff={fileDiff}
          lineAnnotations={lineAnnotations}
          options={diffOptions}
          renderAnnotation={renderAnnotation}
          renderGutterUtility={renderGutterUtility}
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
        />
      </Box>
      {aiLineModalNode}
    </>
  );
}

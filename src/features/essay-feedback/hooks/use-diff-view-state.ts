import type { DiffLineAnnotation, OnDiffLineClickProps } from "@pierre/diffs";
import { useCallback, useMemo, useState } from "react";

import type { CommentAnnotationMeta } from "~/features/essay-feedback/components/diff-annotation-row";
import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import type { DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";

type UseDiffViewStateProps = {
  comments: ReturnType<typeof useDiffComments>["comments"];
};

export function useDiffViewState({ comments }: UseDiffViewStateProps) {
  const [pendingComment, setPendingComment] = useState<null | Pick<
    DiffCommentInput,
    "lineNumber" | "side"
  >>(null);
  const [aiLineModal, setAiLineModal] = useState<null | {
    lineNumber: number;
    side: DiffCommentInput["side"];
  }>(null);

  // ? React Compiler 任せにせず手動メモ化:
  // ? pierre/diffs の <FileDiff> は options.onLineClick の参照変化で gutter DOM を
  // ? 再構築するため、再レンダのたびにホバー中の "+" ボタンがちらつく。
  const handleDiffLineClick = useCallback((props: OnDiffLineClickProps) => {
    if (props.type !== "diff-line") {
      return;
    }

    if (props.annotationSide == null) {
      return;
    }

    setPendingComment({ lineNumber: props.lineNumber, side: props.annotationSide });
  }, []);

  // ? React Compiler 任せにせず手動メモ化:
  // ? lineAnnotations は <FileDiff lineAnnotations={...}> に渡す配列。
  // ? 新参照のたびに pierre/diffs が注釈行を作り直し、入力中フォームのフォーカスが飛ぶ。
  const lineAnnotations = useMemo((): DiffLineAnnotation<CommentAnnotationMeta>[] => {
    const grouped = new Map<
      DiffCommentInput["side"],
      Map<
        number,
        {
          ai: UseDiffViewStateProps["comments"];
          user: UseDiffViewStateProps["comments"];
        }
      >
    >();

    for (const comment of comments) {
      const sideMap = grouped.get(comment.side) ?? new Map();
      const bucket = sideMap.get(comment.lineNumber) ?? { ai: [], user: [] };

      if (comment.kind === "ai") {
        bucket.ai.push(comment);
      } else {
        bucket.user.push(comment);
      }

      sideMap.set(comment.lineNumber, bucket);
      grouped.set(comment.side, sideMap);
    }

    const annotations: DiffLineAnnotation<CommentAnnotationMeta>[] = [];
    for (const [side, sideMap] of grouped) {
      for (const [lineNumber, { ai, user }] of sideMap) {
        annotations.push({
          lineNumber,
          metadata: { aiComments: ai, type: "thread", userComments: user },
          side,
        });
      }
    }

    return annotations;
  }, [comments]);

  return {
    aiLineModal,
    handleDiffLineClick,
    lineAnnotations,
    pendingComment,
    setAiLineModal,
    setPendingComment,
  } as const;
}

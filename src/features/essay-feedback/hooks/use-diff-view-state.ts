import type {
  DiffLineAnnotation,
  OnDiffLineClickProps,
  OnDiffLineEnterLeaveProps,
} from "@pierre/diffs";
import { useState } from "react";

import type { CommentAnnotationMeta } from "~/features/essay-feedback/components/diff-annotation-row";
import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import type { DiffCommentInput } from "~/features/essay-feedback/schemas/essay-schema";

const isChangeLine = (lineType: OnDiffLineClickProps["lineType"]) =>
  lineType === "change-addition" || lineType === "change-deletion";

type UseDiffViewStateProps = {
  comments: ReturnType<typeof useDiffComments>["comments"];
  readonly: boolean;
};

export function useDiffViewState({ comments, readonly }: UseDiffViewStateProps) {
  const [pendingComment, setPendingComment] = useState<null | Pick<
    DiffCommentInput,
    "lineNumber" | "side"
  >>(null);
  const [lineHoverPreview, setLineHoverPreview] = useState<null | {
    left: number;
    text: string;
    top: number;
  }>(null);
  const [aiLineModal, setAiLineModal] = useState<null | {
    lineNumber: number;
    side: DiffCommentInput["side"];
  }>(null);

  function handleDiffLineClick(props: OnDiffLineClickProps) {
    if (readonly) {
      return;
    }

    if (props.type !== "diff-line") {
      return;
    }

    if (props.annotationSide == null) {
      return;
    }

    setPendingComment({ lineNumber: props.lineNumber, side: props.annotationSide });
  }

  function handleDiffLineEnter(props: OnDiffLineEnterLeaveProps) {
    if (props.type !== "diff-line" || !isChangeLine(props.lineType)) {
      setLineHoverPreview(null);
      return;
    }

    const ai = comments.filter(
      (c) =>
        c.lineNumber === props.lineNumber && c.side === props.annotationSide && c.author === "ai",
    );

    if (ai.length === 0) {
      setLineHoverPreview(null);
      return;
    }

    const text = ai
      .map((c) => `${c.body}${c.suggestion != null ? ` — ${c.suggestion}` : ""}`)
      .join(" ");
    const rect = props.lineElement.getBoundingClientRect();

    setLineHoverPreview({
      left: Math.min(rect.left, globalThis.innerWidth - 340),
      text,
      top: rect.bottom + 6,
    });
  }

  function handleDiffLineLeave() {
    setLineHoverPreview(null);
  }

  const lineAnnotations = ((): DiffLineAnnotation<CommentAnnotationMeta>[] => {
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

      if (comment.author === "ai") {
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

    if (
      pendingComment != null &&
      !annotations.some(
        (a) => a.side === pendingComment.side && a.lineNumber === pendingComment.lineNumber,
      )
    ) {
      annotations.push({
        lineNumber: pendingComment.lineNumber,
        metadata: { type: "new-comment" },
        side: pendingComment.side,
      });
    }

    return annotations;
  })();

  return {
    aiLineModal,
    handleDiffLineClick,
    handleDiffLineEnter,
    handleDiffLineLeave,
    lineAnnotations,
    lineHoverPreview,
    pendingComment,
    setAiLineModal,
    setPendingComment,
  } as const;
}

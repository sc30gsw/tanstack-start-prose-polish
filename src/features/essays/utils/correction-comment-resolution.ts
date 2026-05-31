import type {
  AiCommentItem,
  AiComments,
  AiCorrectedBody,
} from "~/features/essays/schemas/ai-schema";
import type { EssayBodyInput } from "~/features/essays/schemas/essay-ai-input-schema";
import type { DiffCommentInput } from "~/features/essays/schemas/essay-schema";

const MAX_AI_COMMENTS = 8;

export function normalizeCorrectedBody(
  correctedBody: AiCorrectedBody["correctedBody"],
  originalText: EssayBodyInput["text"],
) {
  //? 前後完全一致だと @pierre/diffs の hunk が 0 になり本文が描画されない
  return correctedBody === originalText ? `${correctedBody}\n` : correctedBody;
}

//? snippet を行に照合する。完全一致 → 空白正規化・大小無視で再照合の順に試す（折返しや句読点のズレで落とさない）
function findSnippetLine(lines: string[], snippet: AiCommentItem["snippet"]) {
  const exact = lines.findIndex((line) => line.includes(snippet));
  if (exact !== -1) {
    return exact;
  }

  const normalize = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();
  const needle = normalize(snippet);
  if (needle.length === 0) {
    return -1;
  }

  return lines.findIndex((line) => normalize(line).includes(needle));
}

// ? snippet を correctedBody の行に照合して lineNumber を確定する（LLM の行番号は信用しない）
export function resolveComments(
  object: AiComments,
  correctedBody: AiCorrectedBody["correctedBody"],
) {
  const lines = correctedBody.split("\n");
  const comments: Array<Pick<DiffCommentInput, "body" | "lineNumber" | "side" | "suggestion">> = [];

  for (const comment of object.comments.slice(0, MAX_AI_COMMENTS)) {
    const snippet = comment.snippet.trim();
    if (!snippet) {
      continue;
    }

    const idx = findSnippetLine(lines, snippet);
    if (idx === -1) {
      continue;
    }

    comments.push({
      body: comment.body,
      lineNumber: idx + 1,
      side: "additions",
      ...(comment.suggestion ? { suggestion: comment.suggestion } : {}),
    });
  }

  return comments;
}

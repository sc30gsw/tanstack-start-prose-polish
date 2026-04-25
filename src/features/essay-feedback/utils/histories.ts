import type { InstaQLEntity } from "@instantdb/react";

import type { AppSchema } from "~/lib/instant-schema";

function trimPrompt(
  prompt: NonNullable<InstaQLEntity<AppSchema, "essays">["prompt"]>,
  max: NonNullable<InstaQLEntity<AppSchema, "essays">["toeicMax"]>,
) {
  return prompt.length > max ? `${prompt.slice(0, max)}…` : prompt;
}

export function deriveTitle({
  mode,
  bodyBefore,
  prompt,
}: Pick<InstaQLEntity<AppSchema, "essays">, "mode" | "bodyBefore" | "prompt">) {
  const first = bodyBefore.trim();
  const bodyTitle = first.length > 50 ? `${first.slice(0, 50)}…` : first || "（無題）";
  const p = prompt?.trim() ?? "";

  if (mode === "free") {
    return bodyTitle;
  }

  if (mode === "diverse" || mode === "philosophy" || mode === "topic") {
    if (p.length > 0) {
      return trimPrompt(p, 60);
    }
    return bodyTitle;
  }

  return bodyTitle;
}

export function derivePreview({
  mode,
  bodyBefore,
  prompt,
}: Pick<InstaQLEntity<AppSchema, "essays">, "mode" | "bodyBefore" | "prompt">) {
  if (mode !== "topic") {
    return null;
  }

  if (prompt == null || prompt.trim().length === 0) {
    return null;
  }

  const firstLine = bodyBefore.trim().split("\n")[0] ?? "";

  if (firstLine.length === 0) {
    return null;
  }

  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine;
}

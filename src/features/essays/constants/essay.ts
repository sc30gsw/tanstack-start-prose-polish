export const ESSAY_MODE = ["free", "topic", "diverse"] as const satisfies readonly string[];
export const ESSAY_STATUS = ["draft", "scoring", "reviewed"] as const satisfies readonly string[];
export const MAX_ESSAY_BODY_CHARS = 10_000;
export const SCORE_CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const satisfies readonly string[];
export const DIFF_COMMENT_KIND = ["ai", "user"] as const satisfies readonly string[];

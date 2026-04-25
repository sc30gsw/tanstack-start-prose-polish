import type { Score } from "~/features/essay-feedback/schemas/essay-schema";

type ScoringStage = "idle" | "score" | "cefr" | "toeic" | "done";

export type ScoringState = {
  feedbackReady: boolean;
  result: Partial<Score>;
  stage: ScoringStage;
};

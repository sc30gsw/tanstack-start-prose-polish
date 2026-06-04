import type { Score } from "~/features/essays/schemas/essay-schema";

//? "topic" はテーマ適合判定中（テーマあり時のみ通過する最終ステージ）
type ScoringStage = "idle" | "score" | "cefr" | "toeic" | "topic" | "done";

export type ScoringState = {
  feedbackReady: boolean;
  result: Partial<Score>;
  stage: ScoringStage;
};

import type { EssayAiContext } from "~/features/essays/schemas/essay-ai-input-schema";

//? テーマ(お題)を持つのは topic / diverse の両モード。free はテーマなし。
//? AI 評価(添削・コメント・採点)へテーマ文脈を渡すか否かの単一判定点
export function topicPrompt(mode: EssayAiContext["mode"], prompt: EssayAiContext["prompt"]) {
  return (mode === "topic" || mode === "diverse") && prompt ? prompt : null;
}

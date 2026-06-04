import type { LanguageModel } from "ai";

//? 正確なモデル一覧は `curl https://ai-gateway.vercel.sh/v1/models` で取得
//? anthropic/claude-haiku-4.5 は無料アカウントのレート制限が厳しく 429 頻発のため変更
export const AI_MODEL: LanguageModel = "google/gemini-2.5-flash-lite";

export function isAiEnabled() {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

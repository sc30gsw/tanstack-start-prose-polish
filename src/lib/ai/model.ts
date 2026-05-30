import type { LanguageModel } from "ai";

//? 正確なモデル一覧は `curl https://ai-gateway.vercel.sh/v1/models` で取得
export const AI_MODEL: LanguageModel = "anthropic/claude-haiku-4.5";

export function isAiEnabled() {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

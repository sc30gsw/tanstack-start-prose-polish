import { id, type InstaQLEntity } from "@instantdb/admin";

import { adminDb } from "~/db/instant-admin";
import type { AppSchema } from "~/db/instant-schema";
import type { DailyPromptInput } from "~/features/essays/schemas/essay-ai-input-schema";

type DailyPromptMode = "diverse" | "topic";

export async function getCachedDailyPrompt(
  userId: InstaQLEntity<AppSchema, "$users">["id"],
  dateKey: DailyPromptInput["dateKey"],
  mode: DailyPromptMode,
) {
  const result = await adminDb.query({
    dailyPrompts: {
      $: { where: { dateKey, mode, userId } },
    },
  });

  return result.dailyPrompts[0] ?? null;
}

export async function saveDailyPrompt(
  userId: InstaQLEntity<AppSchema, "$users">["id"],
  dateKey: DailyPromptInput["dateKey"],
  mode: DailyPromptMode,
  payload: NonNullable<Awaited<ReturnType<typeof getCachedDailyPrompt>>>["payload"],
) {
  const existing = await getCachedDailyPrompt(userId, dateKey, mode);
  if (existing) {
    return existing;
  }

  const promptId = id();
  const tx = adminDb.tx.dailyPrompts[promptId];
  if (!tx) {
    throw new Error("Failed to create daily prompt transaction");
  }

  await adminDb.transact(
    tx.update({
      createdAt: new Date(),
      dateKey,
      mode,
      payload,
      userId,
    }),
  );

  return { createdAt: new Date(), dateKey, id: promptId, mode, payload, userId };
}

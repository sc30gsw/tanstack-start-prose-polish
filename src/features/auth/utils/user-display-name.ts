import type { InstaQLEntity } from "@instantdb/react";

import type { AppSchema } from "~/db/instant-schema";

export function getUserDisplayName(
  username: InstaQLEntity<AppSchema, "$users">["username"],
  email: InstaQLEntity<AppSchema, "$users">["email"] | null | undefined,
) {
  const u = username?.trim();

  if (u) {
    return u;
  }

  return email?.split("@")[0] ?? "ユーザー";
}

export function getUserInitials(displayName: string) {
  const t = displayName.trim();

  if (t.length === 0) {
    return "?";
  }

  return t.length <= 2 ? t : t.slice(0, 2);
}

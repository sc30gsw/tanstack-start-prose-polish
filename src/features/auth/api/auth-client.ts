import type { InstaQLEntity } from "@instantdb/react";
import { Result } from "better-result";

import { db } from "~/lib/instant";
import type { AppSchema } from "~/lib/instant-schema";

export function sendMagicCode(email: InstaQLEntity<AppSchema, "$users">["email"]) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => db.auth.sendMagicCode({ email }),
  });
}

export function signInWithMagicCode(
  email: InstaQLEntity<AppSchema, "$users">["email"],
  code: string,
  username: InstaQLEntity<AppSchema, "$users">["username"],
) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => db.auth.signInWithMagicCode({ code, email, extraFields: { username } }),
  });
}

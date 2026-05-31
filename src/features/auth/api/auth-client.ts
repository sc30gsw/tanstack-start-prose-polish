import type { InstaQLEntity } from "@instantdb/react";
import { Result } from "better-result";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { AuthError } from "~/features/auth/types/auth-error";

export function sendMagicCode(email: InstaQLEntity<AppSchema, "$users">["email"]) {
  return Result.tryPromise({
    catch: (e) =>
      new AuthError({
        cause: e,
        message: e instanceof Error ? e.message : "コードの送信に失敗しました",
      }),
    try: () => db.auth.sendMagicCode({ email }),
  });
}

export function signInWithMagicCode(
  email: InstaQLEntity<AppSchema, "$users">["email"],
  code: string,
  username: InstaQLEntity<AppSchema, "$users">["username"],
) {
  return Result.tryPromise({
    catch: (e) =>
      new AuthError({
        cause: e,
        message: e instanceof Error ? e.message : "サインインに失敗しました",
      }),
    try: () => db.auth.signInWithMagicCode({ code, email, extraFields: { username } }),
  });
}

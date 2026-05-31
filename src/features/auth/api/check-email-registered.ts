import type { InstaQLEntity } from "@instantdb/react";
import { createServerFn } from "@tanstack/react-start";
import { Result } from "better-result";
import * as v from "valibot";

import { adminDb } from "~/db/instant-admin";
import type { AppSchema } from "~/db/instant-schema";
import { signUpSchema } from "~/features/auth/schemas/login-schema";
import { AuthError } from "~/features/auth/types/auth-error";

const checkEmailRegisteredFn = createServerFn({ method: "POST" })
  .inputValidator(v.pick(signUpSchema, ["email"]))
  .handler(async ({ data }) => {
    const result = await adminDb.query({
      $users: { $: { where: { email: data.email } } },
    });

    return { registered: result.$users.length > 0 };
  });

export function checkEmailRegistered(email: InstaQLEntity<AppSchema, "$users">["email"]) {
  return Result.tryPromise({
    catch: (e) =>
      new AuthError({
        cause: e,
        message: e instanceof Error ? e.message : "メール確認に失敗しました",
      }),
    try: () => checkEmailRegisteredFn({ data: { email } }),
  });
}

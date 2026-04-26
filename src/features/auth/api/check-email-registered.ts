import type { InstaQLEntity } from "@instantdb/react";
import { createServerFn } from "@tanstack/react-start";
import { Result } from "better-result";
import * as v from "valibot";

import { signUpSchema } from "~/features/auth/schemas/login-schema";
import { adminDb } from "~/lib/instant-admin";
import type { AppSchema } from "~/lib/instant-schema";

const checkEmailRegisteredFn = createServerFn({ method: "POST" })
  .inputValidator(v.pick(signUpSchema, ["email"]))
  .handler(async ({ data }) => {
    const result = await adminDb.query({
      $users: { $: { where: { email: data.email } } },
    });

    return { registered: result.$users.length > 0 };
  });

export function checkEmailRegistered(email: InstaQLEntity<AppSchema, "$users">["email"]) {
  return Result.tryPromise<{ registered: boolean }, Error>({
    catch: (e) => e as Error,
    try: () => checkEmailRegisteredFn({ data: { email } }),
  });
}

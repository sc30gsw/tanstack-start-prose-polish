import * as v from "valibot";
import type { BaseIssue, InferInput } from "valibot";

import { MAGIC_CODE_LENGTH } from "~/features/auth/constants/auth";

export const emailSchema = v.object({
  email: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
  username: v.pipe(v.string(), v.minLength(1, "ユーザー名を入力してください")),
});

export const emailOnlySchema = v.object({
  email: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
});

export const magicCodeSchema = v.object({
  code: v.pipe(
    v.string(),
    v.length(MAGIC_CODE_LENGTH, `${MAGIC_CODE_LENGTH}桁のコードを入力してください`),
    v.regex(/^\d+$/, "数字のみ入力してください"),
  ),
});

/** マジックリンクフロー全体のフォーム（メール＋コードを同一 `useForm` で保持） */
export type LoginFormValues = InferInput<typeof emailSchema> & InferInput<typeof magicCodeSchema>;

export const loginFormEmptyValues = {
  code: "",
  email: "",
  username: "",
} satisfies LoginFormValues;

type LoginFormFieldKey = keyof LoginFormValues;

function firstObjectPathKey(issue: BaseIssue<unknown>): string | undefined {
  const head = issue.path?.[0] as { key?: PropertyKey; type?: string } | undefined;
  if (head?.type === "object" && head.key !== undefined) {
    return String(head.key);
  }
  return undefined;
}

/**
 * TanStack Form 用: Valibot の issue を `fields` に落とし、各フィールドにエラーを出せるようにする
 */
export function getLoginFormValidationError(
  step: "code" | "email",
  value: LoginFormValues,
  mode: "signin" | "signup" = "signin",
): { fields: Partial<Record<LoginFormFieldKey, string>> } | undefined {
  if (step === "email") {
    const schema = mode === "signup" ? emailSchema : emailOnlySchema;
    const parseValue =
      mode === "signup" ? { email: value.email, username: value.username } : { email: value.email };
    const result = v.safeParse(schema, parseValue);
    if (result.success) {
      return undefined;
    }
    const fields: Partial<Record<LoginFormFieldKey, string>> = {};
    for (const issue of result.issues) {
      const key = firstObjectPathKey(issue) as LoginFormFieldKey | undefined;
      if ((key === "email" || key === "username") && fields[key] === undefined) {
        fields[key] = issue.message;
      }
    }
    return { fields };
  }

  const result = v.safeParse(magicCodeSchema, { code: value.code });
  if (result.success) {
    return undefined;
  }
  const fields: Partial<Record<LoginFormFieldKey, string>> = {};
  for (const issue of result.issues) {
    if (firstObjectPathKey(issue) === "code" && fields.code === undefined) {
      fields.code = issue.message;
    }
  }
  return { fields };
}

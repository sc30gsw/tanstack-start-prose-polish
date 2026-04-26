import * as v from "valibot";
import type { InferInput } from "valibot";

import { MAGIC_CODE_LENGTH } from "~/features/auth/constants/auth";

export const emailSchema = v.object({
  email: v.pipe(v.string(), v.email("有効なメールアドレスを入力してください")),
  username: v.pipe(v.string(), v.minLength(1, "ユーザー名を入力してください")),
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

import { Alert, Paper, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import * as v from "valibot";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import { LoginEmailStep } from "~/features/auth/components/email-step";
import { LoginMagicCodeStep } from "~/features/auth/components/magic-code-step";
import { useAppForm } from "~/features/auth/hooks/create-login-form";
import {
  emailSchema,
  loginFormEmptyValues,
  magicCodeSchema,
} from "~/features/auth/schemas/login-schema";

const routeApi = getRouteApi("/login");

export function LoginForm() {
  const { returnTo } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [step, setStep] = useState<"code" | "email">("email");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
    defaultValues: loginFormEmptyValues,
    onSubmit: ({ value }) => {
      startTransition(async () => {
        if (step === "email") {
          setErrorMessage(null);

          const result = await sendMagicCode(value.email);

          result.match({
            err: (e) => {
              setErrorMessage(e.message || "コードの送信に失敗しました。");
            },
            ok: () => {
              setStep("code");
            },
          });

          return;
        }

        setErrorMessage(null);

        const result = await signInWithMagicCode(value.email, value.code, value.username);

        result.match({
          err: (e) => {
            setErrorMessage(e.message || "サインインに失敗しました。コードを確認してください。");
          },
          ok: () => {
            void navigate({ to: returnTo ?? "/" });
          },
        });
      });
    },
    validators: {
      onChange: ({ value }) => {
        if (step === "email") {
          const result = v.safeParse(emailSchema, {
            email: value.email,
            username: value.username,
          });

          return result.success
            ? undefined
            : (result.issues[0]?.message ?? "入力を確認してください");
        }

        const result = v.safeParse(magicCodeSchema, { code: value.code });

        return result.success ? undefined : (result.issues[0]?.message ?? "入力を確認してください");
      },
    },
  });

  return (
    <Paper p="xl" radius="md" shadow="md" w={400} withBorder>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <Stack gap="md">
          {errorMessage && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              onClose={() => setErrorMessage(null)}
              title="エラー"
              withCloseButton
            >
              {errorMessage}
            </Alert>
          )}
          {step === "email" ? (
            <LoginEmailStep form={form} isLoading={isPending} />
          ) : (
            <LoginMagicCodeStep
              form={form}
              isLoading={isPending}
              onBack={() => {
                setStep("email");
                setErrorMessage(null);
                form.setFieldValue("code", "");
              }}
            />
          )}
        </Stack>
      </form>
    </Paper>
  );
}

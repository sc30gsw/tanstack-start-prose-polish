import { Alert, Anchor, Paper, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState, useTransition } from "react";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import { LoginEmailStep } from "~/features/auth/components/email-step";
import { LoginMagicCodeStep } from "~/features/auth/components/magic-code-step";
import { useAppForm } from "~/features/auth/hooks/create-login-form";
import {
  getLoginFormValidationError,
  loginFormEmptyValues,
} from "~/features/auth/schemas/login-schema";

export function LoginForm() {
  const [step, setStep] = useState<"code" | "email">("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const form = useAppForm({
    canSubmitWhenInvalid: true,
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

        const username = mode === "signup" ? value.username : "";
        const result = await signInWithMagicCode(value.email, value.code, username);

        result.match({
          err: (e) => {
            setErrorMessage(e.message || "サインインに失敗しました。コードを確認してください。");
          },
          // db.useAuth() state update → login.tsx <db.SignedIn><SignedInRedirect> handles redirect
          ok: () => {},
        });
      });
    },
    validators: {
      onChange: ({ value }) => getLoginFormValidationError(step, value, mode),
      onSubmit: ({ value }) => getLoginFormValidationError(step, value, mode),
    },
  });

  function handleModeSwitch() {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setStep("email");
    setErrorMessage(null);
    form.reset();
  }

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
            <>
              <LoginEmailStep form={form} isLoading={isPending} isSignUp={mode === "signup"} />
              <Text c="dimmed" size="sm" ta="center">
                {mode === "signin" ? (
                  <>
                    アカウントをお持ちでない方は{" "}
                    <Anchor component="button" fw={500} onClick={handleModeSwitch} type="button">
                      サインアップ
                    </Anchor>
                  </>
                ) : (
                  <>
                    すでにアカウントをお持ちの方は{" "}
                    <Anchor component="button" fw={500} onClick={handleModeSwitch} type="button">
                      サインイン
                    </Anchor>
                  </>
                )}
              </Text>
            </>
          ) : (
            <LoginMagicCodeStep
              form={form}
              isLoading={isPending}
              isResending={isResending}
              onBack={() => {
                setStep("email");
                setErrorMessage(null);
                form.setFieldValue("code", "");
              }}
              onResend={() => {
                startResendTransition(async () => {
                  setErrorMessage(null);

                  const result = await sendMagicCode(form.getFieldValue("email"));

                  result.match({
                    err: (e) => {
                      setErrorMessage(e.message || "コードの再送に失敗しました。");
                    },
                    ok: () => {},
                  });
                });
              }}
            />
          )}
        </Stack>
      </form>
    </Paper>
  );
}

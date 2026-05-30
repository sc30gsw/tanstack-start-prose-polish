import { Alert, Anchor, Paper, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import { checkEmailRegistered } from "~/features/auth/api/check-email-registered";
import { LoginEmailStep } from "~/features/auth/components/email-step";
import { LoginMagicCodeStep } from "~/features/auth/components/magic-code-step";
import { useAppForm } from "~/features/auth/hooks/create-login-form";
import {
  getLoginFormValidationError,
  loginFormEmptyValues,
} from "~/features/auth/schemas/login-schema";

const routeApi = getRouteApi("/login");

export function LoginForm() {
  const { mode } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [step, setStep] = useState<"code" | "email">("email");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const [isResending, setIsResending] = useState(false);

  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: loginFormEmptyValues,
    onSubmit: async ({ value }) => {
      if (step === "email") {
        setErrorMessage(null);

        if (mode === "signin") {
          const checkResult = await checkEmailRegistered(value.email);
          let shouldProceed = true;

          checkResult.match({
            err: () => {
              setErrorMessage("メールアドレスの確認中にエラーが発生しました。");
              shouldProceed = false;
            },
            ok: ({ registered }) => {
              if (!registered) {
                setErrorMessage(
                  "このメールアドレスは登録されていません。サインアップしてください。",
                );
                shouldProceed = false;
              }
            },
          });

          if (!shouldProceed) {
            return;
          }
        }

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

      return result.match({
        err: (e) => {
          setErrorMessage(e.message || "サインインに失敗しました。コードを確認してください。");
        },
        //? db.useAuth() state update → login.tsx <db.SignedIn><SignedInRedirect> handles redirect
        ok: () => {},
      });
    },
    validators: {
      onChange: ({ value }) => getLoginFormValidationError(step, value, mode),
      onSubmit: ({ value }) => getLoginFormValidationError(step, value, mode),
    },
  });

  function handleModeSwitch() {
    navigate({ search: (prev) => ({ ...prev, mode: mode === "signin" ? "signup" : "signin" }) });

    setStep("email");
    setErrorMessage(null);

    form.reset();
  }

  return (
    <Paper p="xl" radius="md" shadow="md" w={400} withBorder>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
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
              <Text c="red.8" size="sm">
                {errorMessage}
              </Text>
            </Alert>
          )}
          {step === "email" ? (
            <>
              <LoginEmailStep form={form} isSignUp={mode === "signup"} />
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
              isResending={isResending}
              onBack={() => {
                setStep("email");
                setErrorMessage(null);
                form.setFieldValue("code", "");
              }}
              onResend={async () => {
                setErrorMessage(null);
                setIsResending(true);
                const result = await sendMagicCode(form.getFieldValue("email"));

                result.match({
                  err: (e) => {
                    setErrorMessage(e.message || "コードの再送に失敗しました。");
                  },
                  ok: () => {
                    setIsResending(false);
                  },
                });
              }}
            />
          )}
        </Stack>
      </form>
    </Paper>
  );
}

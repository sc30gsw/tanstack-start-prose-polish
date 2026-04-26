import { Alert, Paper, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { useState, useTransition } from "react";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import { LoginEmailStep } from "~/features/auth/components/email-step";
import { LoginMagicCodeStep } from "~/features/auth/components/magic-code-step";
import { useAppForm } from "~/features/auth/hooks/create-login-form";
import {
  getLoginFormValidationError,
  loginFormEmptyValues,
} from "~/features/auth/schemas/login-schema";

const routeApi = getRouteApi("/login");

export function LoginForm() {
  const { returnTo } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [step, setStep] = useState<"code" | "email">("email");
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

        const result = await signInWithMagicCode(value.email, value.code, value.username);

        result.match({
          err: (e) => {
            setErrorMessage(e.message || "サインインに失敗しました。コードを確認してください。");
          },
          ok: () => {
            navigate({ to: returnTo ?? "/" });
          },
        });
      });
    },
    validators: {
      onChange: ({ value }) => getLoginFormValidationError(step, value),
      onSubmit: ({ value }) => getLoginFormValidationError(step, value),
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

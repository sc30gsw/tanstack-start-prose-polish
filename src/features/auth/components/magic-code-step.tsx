import { Button, Group, PinInput, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { MAGIC_CODE_LENGTH } from "~/features/auth/constants/auth";
import { withForm } from "~/features/auth/hooks/create-login-form";
import { loginFormEmptyValues } from "~/features/auth/schemas/login-schema";

const RESEND_COOLDOWN_SECONDS = 30;

export const LoginMagicCodeStep = withForm({
  defaultValues: loginFormEmptyValues,
  props: { isLoading: false, isResending: false, onBack: () => {}, onResend: () => {} },
  render: function LoginMagicCodeStepRender({ form, isLoading, isResending, onBack, onResend }) {
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    useEffect(() => {
      if (cooldown <= 0) {
        return;
      }

      const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);

      return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
      onResend();
      setCooldown(RESEND_COOLDOWN_SECONDS);
    };

    return (
      <Stack gap="md">
        <form.Subscribe selector={(s) => s.values.email}>
          {(email) => (
            <div>
              <Title order={2} size="h4">
                コードを入力
              </Title>
              <Text c="dimmed" mt={4} size="sm">
                <Text component="span" fw={600}>
                  {email}
                </Text>{" "}
                に送信された {MAGIC_CODE_LENGTH} 桁のコードを入力してください。
              </Text>
            </div>
          )}
        </form.Subscribe>
        <form.Subscribe selector={(s) => s.submissionAttempts}>
          {(submissionAttempts) => (
            <form.Field name="code">
              {(field) => {
                const showError =
                  Boolean(field.state.meta.errors[0]) &&
                  (field.state.meta.isTouched || submissionAttempts > 0);
                return (
                  <Stack align="center" gap="xs">
                    <PinInput
                      aria-label="確認コード"
                      error={showError}
                      length={MAGIC_CODE_LENGTH}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      oneTimeCode
                      placeholder=""
                      size="lg"
                      type="number"
                      value={field.state.value}
                      disabled={isLoading || isResending}
                    />
                    {showError && field.state.meta.errors[0] && (
                      <Text c="red" size="xs">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </Stack>
                );
              }}
            </form.Field>
          )}
        </form.Subscribe>
        <Stack gap="xs">
          <Button
            disabled={isLoading || isResending}
            loading={isLoading}
            size="md"
            type="submit"
            fullWidth
          >
            サインイン
          </Button>
          <Group justify="space-between">
            <Button disabled={isLoading || isResending} onClick={onBack} size="xs" variant="subtle">
              メールアドレス入力に戻る
            </Button>
            <Button
              disabled={cooldown > 0 || isLoading || isResending}
              loading={isResending}
              onClick={handleResend}
              size="xs"
              variant="subtle"
            >
              {cooldown > 0 ? `再送（${cooldown}秒）` : "コードを再送"}
            </Button>
          </Group>
        </Stack>
      </Stack>
    );
  },
});

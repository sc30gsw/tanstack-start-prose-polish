import { Button, Group, PinInput, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { MAGIC_CODE_LENGTH } from "~/features/auth/constants/auth";
import { withForm } from "~/features/auth/hooks/create-login-form";
import { loginFormEmptyValues } from "~/features/auth/schemas/login-schema";

const RESEND_COOLDOWN_SECONDS = 30;

export const LoginMagicCodeStep = withForm({
  defaultValues: loginFormEmptyValues,
  props: { isResending: false, onBack: () => {}, onResend: () => {} },
  render: function LoginMagicCodeStepRender({ form, isResending, onBack, onResend }) {
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
        <form.Subscribe selector={(s) => [s.submissionAttempts, s.isSubmitting] as const}>
          {([submissionAttempts, isSubmitting]) => (
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
                      disabled={isSubmitting || isResending}
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
        <form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit] as const}>
          {([isSubmitting, canSubmit]) => (
            <Stack gap="xs">
              <Button
                disabled={!canSubmit || isSubmitting || isResending}
                loading={isSubmitting}
                size="md"
                type="submit"
                fullWidth
              >
                サインイン
              </Button>
              <Group justify="space-between">
                <Button
                  disabled={isSubmitting || isResending}
                  onClick={onBack}
                  size="xs"
                  variant="subtle"
                >
                  メールアドレス入力に戻る
                </Button>
                <Button
                  disabled={cooldown > 0 || isSubmitting || isResending}
                  loading={isResending}
                  onClick={handleResend}
                  size="xs"
                  variant="subtle"
                >
                  {cooldown > 0 ? `再送（${cooldown}秒）` : "コードを再送"}
                </Button>
              </Group>
            </Stack>
          )}
        </form.Subscribe>
      </Stack>
    );
  },
});

import { Button, Stack, Text, TextInput, Title } from "@mantine/core";

import { withForm } from "~/features/auth/hooks/create-login-form";
import { loginFormEmptyValues } from "~/features/auth/schemas/login-schema";

export const LoginEmailStep = withForm({
  defaultValues: loginFormEmptyValues,
  props: { isSignUp: false },
  render: function LoginEmailStepRender({ form, isSignUp }) {
    return (
      <Stack gap="md">
        <div>
          <Title order={2} size="h4">
            {isSignUp ? "サインアップ" : "サインイン"}
          </Title>
          <Text c="dimmed" mt={4} size="sm">
            メールアドレスを入力すると、ログインコードをお送りします。
          </Text>
        </div>
        <form.Subscribe
          selector={(s) => [s.submissionAttempts, s.isSubmitting, s.canSubmit] as const}
        >
          {([submissionAttempts, isSubmitting, canSubmit]) => (
            <>
              {isSignUp && (
                <form.Field name="username">
                  {(field) => (
                    <TextInput
                      autoComplete="username"
                      required
                      error={
                        field.state.meta.errors[0] &&
                        (field.state.meta.isTouched || submissionAttempts > 0)
                          ? field.state.meta.errors[0]
                          : undefined
                      }
                      disabled={isSubmitting}
                      label="ユーザー名"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      placeholder="your-name"
                      value={field.state.value}
                    />
                  )}
                </form.Field>
              )}
              <form.Field name="email">
                {(field) => (
                  <TextInput
                    autoComplete="email"
                    required
                    error={
                      field.state.meta.errors[0] &&
                      (field.state.meta.isTouched || submissionAttempts > 0)
                        ? field.state.meta.errors[0]
                        : undefined
                    }
                    inputMode="email"
                    label="メールアドレス"
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={field.state.value}
                  />
                )}
              </form.Field>
              <Button
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
                size="md"
                type="submit"
                fullWidth
              >
                コードを送信
              </Button>
            </>
          )}
        </form.Subscribe>
      </Stack>
    );
  },
});

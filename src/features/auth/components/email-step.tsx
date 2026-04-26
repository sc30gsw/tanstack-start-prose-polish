import { Button, Stack, Text, TextInput, Title } from "@mantine/core";

import { withForm } from "~/features/auth/hooks/create-login-form";
import { loginFormEmptyValues } from "~/features/auth/schemas/login-schema";

export const LoginEmailStep = withForm({
  defaultValues: loginFormEmptyValues,
  props: { isLoading: false },
  render: function LoginEmailStepRender({ form, isLoading }) {
    return (
      <Stack gap="md">
        <div>
          <Title order={2} size="h4">
            サインイン / サインアップ
          </Title>
          <Text c="dimmed" mt={4} size="sm">
            メールアドレスを入力すると、ログインコードをお送りします。
          </Text>
        </div>
        <form.Field name="username">
          {(field) => (
            <TextInput
              autoComplete="username"
              error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              label="ユーザー名"
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="your-name"
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <TextInput
              autoComplete="email"
              error={field.state.meta.isTouched ? field.state.meta.errors[0] : undefined}
              inputMode="email"
              label="メールアドレス"
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="you@example.com"
              type="email"
              value={field.state.value}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(s) => ({ isValid: s.isValid })}>
          {({ isValid }) => (
            <Button disabled={!isValid} loading={isLoading} size="md" type="submit" fullWidth>
              コードを送信
            </Button>
          )}
        </form.Subscribe>
      </Stack>
    );
  },
});

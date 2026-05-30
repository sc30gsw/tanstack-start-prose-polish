import { Center, Loader, Stack } from "@mantine/core";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import { useEffect } from "react";

import { db } from "~/db/instant";
import { LoginForm } from "~/features/auth/components/login-form";
import {
  defaultLoginSearchParams,
  loginSearchParamsSchema,
} from "~/features/auth/schemas/search-params/login-search-params";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: valibotValidator(loginSearchParamsSchema),
  search: {
    middlewares: [stripSearchParams(defaultLoginSearchParams)],
  },
});

function LoginPage() {
  const { isLoading } = db.useAuth();

  if (isLoading) {
    return (
      <Center className="min-h-dvh">
        <Loader aria-label="読み込み中" />
      </Center>
    );
  }

  return (
    <>
      <db.SignedIn>
        <SignedInRedirect />
      </db.SignedIn>
      <db.SignedOut>
        <Center className="min-h-dvh">
          <Stack align="center" gap="lg">
            <LoginForm />
          </Stack>
        </Center>
      </db.SignedOut>
    </>
  );
}

function SignedInRedirect() {
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: returnTo ?? "/" });
  }, [navigate, returnTo]);

  return null;
}

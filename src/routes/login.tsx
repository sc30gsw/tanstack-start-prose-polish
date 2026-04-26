import { Center, Stack } from "@mantine/core";
import { Loader } from "@mantine/core";
import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";

import { LoginForm } from "~/features/auth/components/login-form";
import { loginSearchParamsSchema } from "~/features/auth/schemas/search-params/login-search-params";
import { db } from "~/lib/instant";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: valibotValidator(loginSearchParamsSchema),
});

function LoginPage() {
  return (
    <ClientOnly
      fallback={
        <Center style={{ minHeight: "100vh" }}>
          <Loader aria-label="読み込み中" />
        </Center>
      }
    >
      <LoginPageContent />
    </ClientOnly>
  );
}

function LoginPageContent() {
  return (
    <>
      <db.SignedIn>
        <SignedInRedirect />
      </db.SignedIn>
      <db.SignedOut>
        <Center style={{ minHeight: "100vh" }}>
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

  navigate({ to: returnTo ?? "/" });

  return null;
}

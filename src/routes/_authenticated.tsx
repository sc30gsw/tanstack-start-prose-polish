import { Loader, Stack } from "@mantine/core";
import { ClientOnly, Outlet, createFileRoute } from "@tanstack/react-router";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { AppShellLayout } from "~/components/app-shell-layout";
import { db } from "~/lib/instant";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  return (
    <ClientOnly
      fallback={
        <Stack align="center" justify="center" style={{ minHeight: "100vh" }}>
          <Loader aria-label="読み込み中" />
        </Stack>
      }
    >
      <AuthGuard />
    </ClientOnly>
  );
}

function AuthGuard() {
  return (
    <>
      <db.SignedIn>
        <AppShellLayout>
          <Outlet />
        </AppShellLayout>
      </db.SignedIn>
      <db.SignedOut>
        <RedirectToLogin />
      </db.SignedOut>
    </>
  );
}

function RedirectToLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  navigate({ replace: true, search: { returnTo: pathname }, to: "/login" });

  return null;
}

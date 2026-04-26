import { Loader, Stack } from "@mantine/core";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppShellLayout } from "~/components/app-shell-layout";
import { db } from "~/lib/instant";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { isLoading } = db.useAuth();

  if (isLoading) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Loader aria-label="読み込み中" />
      </Stack>
    );
  }

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

  useEffect(() => {
    navigate({ replace: true, search: { returnTo: location.pathname }, to: "/login" });
  }, [navigate, location.pathname]);

  return null;
}

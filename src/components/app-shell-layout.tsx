import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ReactNode } from "react";

import { AppHeader } from "~/components/app-header";
import { AppSidebar } from "~/components/app-sidebar";

export function AppShellLayout({ children }: Record<"children", ReactNode>) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
        width: 280,
      }}
      padding="md"
    >
      <AppHeader onToggleMobile={toggleMobile} />
      <AppShell.Navbar p="md">
        <AppSidebar />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

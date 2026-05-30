import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ReactNode } from "react";

import { AppHeader } from "~/components/app-header";
import { AppSidebar } from "~/components/app-sidebar";

export function AppShellLayout({ children }: Record<"children", ReactNode>) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        breakpoint: "sm",
        collapsed: { desktop: !desktopOpened, mobile: !mobileOpened },
        width: 280,
      }}
      padding="md"
    >
      <AppHeader
        desktopOpened={desktopOpened}
        mobileOpened={mobileOpened}
        onToggleDesktop={toggleDesktop}
        onToggleMobile={toggleMobile}
      />
      <AppShell.Navbar p="md">
        <AppSidebar onClose={closeMobile} />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

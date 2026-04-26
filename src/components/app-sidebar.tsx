import { AppShell, Button, Divider, NavLink, ScrollArea } from "@mantine/core";
import { IconClockHour3, IconHome, IconPencilPlus } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { UserSidebarFooter } from "~/features/auth/components/user-menu";

export function AppSidebar({ onClose }: Partial<Record<"onClose", () => void>>) {
  const { matches } = useRouterState();
  const isHomeActive = matches.some((m) => m.routeId === "/_authenticated/");
  const isEssaysActive = matches.some((m) => m.routeId === "/_authenticated/essays/");

  return (
    <>
      <Button
        fullWidth
        leftSection={<IconPencilPlus size={16} />}
        mb="md"
        onClick={onClose}
        renderRoot={(props) => <Link to="/essays/new" {...props} />}
        size="md"
      >
        新しい作文を始める
      </Button>

      <AppShell.Section component={ScrollArea} grow>
        <NavLink
          active={isHomeActive}
          label="ホーム"
          leftSection={<IconHome size={16} />}
          onClick={onClose}
          renderRoot={(props) => <Link to="/" {...props} />}
        />
        <NavLink
          active={isEssaysActive}
          label="履歴一覧"
          leftSection={<IconClockHour3 size={16} />}
          onClick={onClose}
          renderRoot={(props) => <Link to="/essays" {...props} />}
        />
      </AppShell.Section>

      <AppShell.Section>
        <Divider mb="xs" />
        <UserSidebarFooter />
      </AppShell.Section>
    </>
  );
}

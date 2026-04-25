import { AppShell, Button, Divider, NavLink, ScrollArea, Text } from "@mantine/core";
import { IconClockHour3, IconHome, IconPencilPlus } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";

export function AppSidebar({ onClose }: Partial<Record<"onClose", () => void>>) {
  const { location } = useRouterState();
  const pathname = location.pathname;

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
          active={pathname === "/"}
          label="ホーム"
          leftSection={<IconHome size={16} />}
          onClick={onClose}
          renderRoot={(props) => <Link to="/" {...props} />}
        />
        <NavLink
          active={pathname === "/essays"}
          label="履歴一覧"
          leftSection={<IconClockHour3 size={16} />}
          onClick={onClose}
          renderRoot={(props) => <Link to="/essays" {...props} />}
        />
      </AppShell.Section>

      <AppShell.Section>
        <Divider mb="xs" />
        <Text c="dimmed" py="xs" size="xs" ta="center">
          ProsePolish v0.1
        </Text>
      </AppShell.Section>
    </>
  );
}

import { ActionIcon, AppShell, Group, Text, ThemeIcon, Tooltip, em } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMoon,
  IconSparkles,
  IconSun,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

type AppHeaderProps = {
  desktopOpened: boolean;
  mobileOpened: boolean;
  onToggleDesktop: () => void;
  onToggleMobile: () => void;
};

export function AppHeader({
  desktopOpened,
  mobileOpened,
  onToggleDesktop,
  onToggleMobile,
}: AppHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const isMobile = useMediaQuery(`(max-width: ${em(767)})`);
  const sidebarOpen = isMobile ? mobileOpened : desktopOpened;
  const handleToggleSidebar = isMobile ? onToggleMobile : onToggleDesktop;

  return (
    <AppShell.Header>
      <Group h="100%" justify="space-between" px="md">
        <Group gap="sm">
          <ActionIcon
            aria-label={sidebarOpen ? "メニューを閉じる" : "メニューを開く"}
            color="gray"
            onClick={handleToggleSidebar}
            size="md"
            variant="subtle"
          >
            {sidebarOpen ? (
              <IconLayoutSidebarLeftCollapse size={20} />
            ) : (
              <IconLayoutSidebarLeftExpand size={20} />
            )}
          </ActionIcon>
          <Link style={{ color: "inherit", textDecoration: "none" }} to="/">
            <Group gap={8}>
              <ThemeIcon color="indigo" radius="md" size="md" variant="light">
                <IconSparkles size={16} />
              </ThemeIcon>
              <Text fw={700} size="lg">
                ProsePolish
              </Text>
            </Group>
          </Link>
        </Group>

        <Group gap="xs">
          <Tooltip label={isDark ? "ライトモードに切替" : "ダークモードに切替"}>
            <ActionIcon
              aria-label={isDark ? "ライトモードに切替" : "ダークモードに切替"}
              color="gray"
              onClick={() => toggleColorScheme()}
              size="md"
              variant="subtle"
            >
              {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </AppShell.Header>
  );
}

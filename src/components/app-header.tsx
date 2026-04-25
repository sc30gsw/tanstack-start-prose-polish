import { ActionIcon, AppShell, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { IconMenu2, IconMoon, IconSparkles, IconSun } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export function AppHeader({ onToggleMobile }: Record<"onToggleMobile", () => void>) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <AppShell.Header>
      <Group h="100%" justify="space-between" px="md">
        <Group gap="sm">
          <ActionIcon
            aria-label="メニューを開く"
            color="gray"
            hiddenFrom="sm"
            onClick={onToggleMobile}
            size="md"
            variant="subtle"
          >
            <IconMenu2 size={20} />
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

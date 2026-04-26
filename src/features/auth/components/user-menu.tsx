import type { InstaQLEntity } from "@instantdb/react";
import { ActionIcon, Avatar, Button, Group, Menu, Stack, Text, Tooltip } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";

import { db } from "~/lib/instant";
import type { AppSchema } from "~/lib/instant-schema";

function getUserDisplayName(user: {
  email: InstaQLEntity<AppSchema, "$users">["email"] | null | undefined;
  username: InstaQLEntity<AppSchema, "$users">["username"];
}) {
  const u = user.username?.trim();

  if (u) {
    return u;
  }

  return user.email?.split("@")[0] ?? "ユーザー";
}

function getUserInitials(displayName: string) {
  const t = displayName.trim();

  if (t.length === 0) {
    return "?";
  }

  return t.length <= 2 ? t : t.slice(0, 2);
}

export function UserSidebarFooter() {
  const { user } = db.useAuth();

  if (!user) {
    return null;
  }

  const appUser = user as InstaQLEntity<AppSchema, "$users">;
  const displayName = getUserDisplayName({
    email: user.email,
    username: appUser.username,
  });
  const email = user.email ?? null;

  return (
    <Stack gap="md" w="100%">
      <Group align="center" gap="sm" px={4} style={{ minWidth: 0 }} w="100%" wrap="nowrap">
        <Avatar
          color="indigo"
          size="lg"
          style={{
            borderRadius: "50%",
            boxShadow: "0 0 0 1px var(--mantine-color-default-border)",
            flexShrink: 0,
          }}
          variant="gradient"
        >
          {getUserInitials(displayName)}
        </Avatar>
        <Stack flex={1} gap={0} maw="100%" style={{ minWidth: 0 }}>
          <Text component="p" fw={600} lineClamp={1} m={0} size="sm" title={displayName}>
            {displayName}
          </Text>
          {email ? (
            <Text c="dimmed" component="p" lineClamp={1} m={0} mt="2px" size="xs" title={email}>
              {email}
            </Text>
          ) : null}
        </Stack>
      </Group>
      <Button
        fullWidth
        aria-label="サインアウト"
        color="red"
        leftSection={<IconLogout size={16} />}
        onClick={() => db.auth.signOut()}
        variant="light"
      >
        ログアウト
      </Button>
    </Stack>
  );
}

export function UserMenu() {
  const { user } = db.useAuth();

  if (!user) {
    return null;
  }

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={(user as InstaQLEntity<AppSchema, "$users">).username}>
          <ActionIcon aria-label="ユーザーメニュー" color="gray" size="md" variant="subtle">
            <IconUser size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" truncate>
            {(user as InstaQLEntity<AppSchema, "$users">).username}
          </Text>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          onClick={() => db.auth.signOut()}
        >
          サインアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

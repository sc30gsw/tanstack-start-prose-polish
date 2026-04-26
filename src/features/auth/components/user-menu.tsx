import { ActionIcon, Avatar, Button, Group, Menu, Stack, Text, Tooltip } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";

import { getUserDisplayName, getUserInitials } from "~/features/auth/utils/user-display-name";
import { db } from "~/lib/instant";

export function UserSidebarFooter() {
  const { user } = db.useAuth();
  const { data } = db.useQuery({ $users: { $: { where: { email: user?.email ?? "" } } } });

  if (!data?.$users?.[0]) {
    return null;
  }

  const profile = data?.$users?.[0];
  const displayName = getUserDisplayName(profile.username, profile.email);
  const email = profile.email;

  return (
    <Stack gap="md" w="100%">
      <Group align="center" gap="sm" px={4} className="min-w-0" w="100%" wrap="nowrap">
        <Avatar
          color="indigo"
          size="lg"
          className="shrink-0 rounded-full shadow-sm"
          variant="gradient"
        >
          {getUserInitials(displayName)}
        </Avatar>
        <Stack flex={1} gap={0} maw="100%" className="min-w-0">
          <Text component="p" fw={600} lineClamp={1} m={0} size="sm" title={displayName}>
            {displayName}
          </Text>
          <Text c="dimmed" component="p" lineClamp={1} m={0} mt="2px" size="xs" title={email}>
            {email}
          </Text>
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
  const { data } = db.useQuery({ $users: { $: { where: { email: user?.email ?? "" } } } });

  if (!data?.$users?.[0]) {
    return null;
  }

  const profile = data?.$users?.[0];
  const displayName = getUserDisplayName(profile.username, profile.email);

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={displayName}>
          <ActionIcon aria-label="ユーザーメニュー" color="gray" size="md" variant="subtle">
            <IconUser size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" truncate>
            {displayName}
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

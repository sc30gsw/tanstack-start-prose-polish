import { ActionIcon, Menu, Text, Tooltip } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";

import { db } from "~/lib/instant";

export function UserMenu() {
  const { user } = db.useAuth();

  if (!user) {
    return null;
  }

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={user.email}>
          <ActionIcon aria-label="ユーザーメニュー" color="gray" size="md" variant="subtle">
            <IconUser size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="xs" truncate>
            {user.email}
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

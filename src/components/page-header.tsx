import { Anchor, Group, Stack, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

import type { FileRoutesByTo } from "~/routeTree.gen";

type PageHeaderProps = {
  backHref?: keyof FileRoutesByTo | ComponentProps<typeof Link>["to"];
  backLabel?: string;
  children?: ReactNode;
  title: string;
};

export function PageHeader({ title, backHref, backLabel, children }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="xl">
      {backHref && (
        <Anchor component={Link} fw={600} size="md" to={backHref} underline="hover">
          ← {backLabel ?? "戻る"}
        </Anchor>
      )}
      {children ? (
        <Group align="center" justify="space-between" wrap="wrap">
          <Title m={0} order={1} size="h2" className="min-w-0">
            {title}
          </Title>
          {children}
        </Group>
      ) : (
        <Title order={1} size="h2">
          {title}
        </Title>
      )}
    </Stack>
  );
}

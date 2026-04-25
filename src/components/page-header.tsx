import { Anchor, Group, Stack, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type PageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  endSection?: ReactNode;
  title: string;
};

export function PageHeader({ title, backHref, backLabel, endSection }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="xl">
      {backHref != null && (
        <Anchor component={Link} fw={600} size="md" to={backHref} underline="hover">
          ← {backLabel ?? "戻る"}
        </Anchor>
      )}
      {endSection != null ? (
        <Group align="center" justify="space-between" wrap="wrap">
          <Title m={0} order={1} size="h2" style={{ minWidth: 0 }}>
            {title}
          </Title>
          {endSection}
        </Group>
      ) : (
        <Title order={1} size="h2">
          {title}
        </Title>
      )}
    </Stack>
  );
}

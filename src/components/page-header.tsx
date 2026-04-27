import { Anchor, Flex, Group, Stack, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  backLink: ReactNode;
  children?: ReactNode;
  title: string;
};

export function PageHeader({ title, backLink, children }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="xl">
      <Anchor fw={600} size="md" underline="hover">
        <Flex align="center" gap="xs" wrap="nowrap">
          <IconArrowLeft size={16} /> {backLink}
        </Flex>
      </Anchor>
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

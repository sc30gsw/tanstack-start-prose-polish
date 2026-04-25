import { Anchor, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";

type PageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
};

export function PageHeader({ title, backHref, backLabel }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="xl">
      {backHref != null && (
        <Anchor component={Link} to={backHref}>
          <Text c="dimmed" size="sm">
            ← {backLabel ?? "戻る"}
          </Text>
        </Anchor>
      )}
      <Title order={1} size="h2">
        {title}
      </Title>
    </Stack>
  );
}

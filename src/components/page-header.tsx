import { Anchor, Stack, Title } from "@mantine/core";
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
        <Anchor component={Link} fw={600} size="md" to={backHref} underline="hover">
          ← {backLabel ?? "戻る"}
        </Anchor>
      )}
      <Title order={1} size="h2">
        {title}
      </Title>
    </Stack>
  );
}

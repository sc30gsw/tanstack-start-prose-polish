import {
  ActionIcon,
  Anchor,
  Collapse,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { ClientOnly } from "@tanstack/react-router";

import { EssayScoringSummaryContainer } from "~/features/essays/components/history/essay-scoring-summary-container";
import { CEFR_TOEIC_BAND_SOURCE } from "~/features/essays/constants/essay";

export function EssayScoringSummaryPaper() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between">
        <Text fw={600} size="md">
          スコアサマリー
        </Text>
        <ActionIcon aria-label="スコアサマリーを開閉する" onClick={toggle} variant="subtle">
          {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </ActionIcon>
      </Group>
      <Collapse expanded={opened}>
        <Stack gap="md" mt="md">
          <ClientOnly fallback={<Skeleton height={280} radius="md" />}>
            <EssayScoringSummaryContainer />
          </ClientOnly>
          <Divider />
          <Group gap={4} wrap="wrap">
            <Text c="dimmed" size="sm">
              * C2 は TOEIC L&R に公式対応なし。
            </Text>
            <Text c="dimmed" size="sm">
              出典:
            </Text>
            <Anchor
              href={CEFR_TOEIC_BAND_SOURCE.url}
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
            >
              {CEFR_TOEIC_BAND_SOURCE.publisher} 公開データ（{CEFR_TOEIC_BAND_SOURCE.testForm}）
            </Anchor>
            <Text c="dimmed" size="sm">
              参照: {CEFR_TOEIC_BAND_SOURCE.citedAt}
            </Text>
          </Group>
        </Stack>
      </Collapse>
    </Paper>
  );
}

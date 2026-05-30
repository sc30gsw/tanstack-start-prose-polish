import { Badge, Group, Stack, Text } from "@mantine/core";

import { CEFR_TOEIC_BANDS, SCORE_CEFR } from "~/features/essays/constants/essay";
import type { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";

export function SummaryBadges({
  cefr,
  toeicMax,
  toeicMin,
}: Pick<
  NonNullable<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>["scoring"]>,
  "cefr" | "toeicMax" | "toeicMin"
>) {
  const band = CEFR_TOEIC_BANDS[cefr as (typeof SCORE_CEFR)[number]];

  return (
    <Stack gap={6}>
      <Text fw={500} size="sm">
        あなたのレベル
      </Text>
      <Group gap="xs">
        <Badge color={band.color} size="lg">
          {band.label}
        </Badge>
        <Badge color="grape" size="lg" variant="outline">
          TOEIC L&R {toeicMin}–{toeicMax} 点
        </Badge>
      </Group>
    </Stack>
  );
}

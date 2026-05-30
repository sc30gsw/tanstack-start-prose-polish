import { BarChart } from "@mantine/charts";
import { Badge, Paper, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import type { TooltipPayload } from "recharts";

import { CEFR_TOEIC_BANDS, SCORE_CEFR } from "~/features/essays/constants/essay";
import type { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";

type CefrToeicBandsProps = Pick<
  NonNullable<NonNullable<ReturnType<typeof useEssayDetail>["essay"]>["scoring"]>,
  "cefr" | "toeicMax" | "toeicMin"
>;

export function CefrToeicBands({ cefr, toeicMax, toeicMin }: CefrToeicBandsProps) {
  const toeicMid = Math.round((toeicMin + toeicMax) / 2);
  const userColor = CEFR_TOEIC_BANDS[cefr as (typeof SCORE_CEFR)[number]].color;

  const bandData = SCORE_CEFR.map((level) => {
    const band = CEFR_TOEIC_BANDS[level];
    const range = Math.max(0, band.toeicMax - band.toeicMin);

    return {
      cefrLevel: level,
      label: band.label,
      spacer: band.toeicMin,
      otherRange: level !== cefr ? range : 0,
      selfRange: level === cefr ? range : 0,
      toeicMax: band.toeicMax,
      toeicMin: band.toeicMin,
    };
  });

  return (
    <Stack gap={4}>
      <Text fw={500} size="sm">
        CEFR レベル別 TOEIC L&R レンジ
      </Text>
      <BarChart
        barProps={{ radius: 6 }}
        data={bandData}
        dataKey="label"
        h={260}
        maxBarWidth={22}
        orientation="vertical"
        type="stacked"
        referenceLines={[
          {
            color: "red.6",
            label: {
              value: `あなた（TOEIC ${toeicMin}–${toeicMax}）`,
              fill: "var(--mantine-color-red-6)",
              fontSize: 12,
              fontWeight: 600,
            },
            x: toeicMid,
          },
        ]}
        series={[
          { color: "transparent", name: "spacer", stackId: "range" },
          { color: "gray.6", name: "otherRange", label: "他レベル", stackId: "range" },
          { color: userColor, name: "selfRange", label: "あなた", stackId: "range" },
        ]}
        tooltipProps={{
          content: ({ label: tooltipLabel, payload }) => (
            <CefrBarTooltip label={tooltipLabel} payload={payload} userCefr={cefr} />
          ),
        }}
        withTooltip
        withLegend={false}
        xAxisLabel="TOEIC L&R スコア"
        xAxisProps={{
          domain: [0, 1000],
          tick: { fontSize: 12 },
        }}
        yAxisProps={{
          tick: { fontSize: 12 },
          width: 96,
        }}
      />
    </Stack>
  );
}

type CefrBarTooltipProps = {
  label?: ReactNode;
  payload?: TooltipPayload;
  userCefr: CefrToeicBandsProps["cefr"];
};
function CefrBarTooltip({ label, payload, userCefr }: CefrBarTooltipProps) {
  if (!payload?.length) {
    return null;
  }

  const entry = payload[0]?.payload;

  if (!entry) {
    return null;
  }

  const isUser = entry.cefrLevel === userCefr;

  return (
    <Paper px="md" py="sm" shadow="md" withBorder>
      <Text fw={500} mb={4} size="sm">
        {label}
      </Text>
      <Text size="sm">
        TOEIC L&R: {entry.toeicMin}〜{entry.toeicMax} 点
      </Text>
      {isUser && (
        <Badge color="red" mt={6} size="sm">
          あなたのレベル
        </Badge>
      )}
    </Paper>
  );
}

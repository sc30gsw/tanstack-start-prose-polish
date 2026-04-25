import { Badge, Box, Grid, Progress, Stack, Text } from "@mantine/core";

import type { ScoringState } from "~/features/essay-feedback/types/essay";

const STAGE_ORDER = ["idle", "score", "cefr", "toeic", "done"] as const;

const labelSpan = { base: 12, md: 3, sm: 4 } as const;
const valueSpan = { base: 12, md: 9, sm: 8 } as const;

/** 英日混在でも自然に折り返し */
const wrapTextStyle = {
  minWidth: 0,
  overflowWrap: "break-word" as const,
  wordBreak: "break-word" as const,
};

type ScoringProgressProps = {
  state: ScoringState;
};

export function ScoringProgress({ state }: ScoringProgressProps) {
  const stageIndex = STAGE_ORDER.indexOf(state.stage);
  const progressValue = (stageIndex / (STAGE_ORDER.length - 1)) * 100;

  return (
    <Stack gap="lg">
      <Progress
        animated={state.stage !== "done"}
        aria-label="採点進捗"
        size="lg"
        value={progressValue}
      />
      <Grid align="flex-start" columns={12} gutter={{ base: "sm", sm: "md" }}>
        <Grid.Col span={labelSpan} style={{ minWidth: 0 }}>
          <Text fw={700} size="md">
            点数
          </Text>
        </Grid.Col>
        <Grid.Col span={valueSpan} style={{ minWidth: 0 }}>
          {state.result.score != null ? (
            <Text fw={700} size="xl" ta="start" w="100%">
              {state.result.score}点
            </Text>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          )}
        </Grid.Col>

        <Grid.Col span={labelSpan} style={{ minWidth: 0 }}>
          <Text fw={700} size="md">
            総合評価
          </Text>
        </Grid.Col>
        <Grid.Col span={valueSpan} style={{ minWidth: 0 }}>
          {state.result.score == null ? (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          ) : state.result.scoreFeedback != null ? (
            <Text component="p" lh={1.65} m={0} size="md" style={wrapTextStyle} ta="start" w="100%">
              {state.result.scoreFeedback}
            </Text>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              —
            </Text>
          )}
        </Grid.Col>

        <Grid.Col span={labelSpan} style={{ minWidth: 0 }}>
          <Text fw={700} size="md">
            CEFR レベル
          </Text>
        </Grid.Col>
        <Grid.Col span={valueSpan} style={{ minWidth: 0 }}>
          {state.result.cefr != null ? (
            <Box style={{ textAlign: "start" as const, width: "100%" }}>
              <Badge
                color="teal"
                size="lg"
                styles={{ label: { fontSize: "var(--mantine-font-size-md)", fontWeight: 700 } }}
                variant="light"
              >
                {state.result.cefr}
              </Badge>
            </Box>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          )}
        </Grid.Col>

        <Grid.Col span={labelSpan} style={{ minWidth: 0 }}>
          <Text fw={700} size="md">
            TOEIC 推定スコア
          </Text>
        </Grid.Col>
        <Grid.Col span={valueSpan} style={{ minWidth: 0 }}>
          {state.result.toeicMin != null && state.result.toeicMax != null ? (
            <Box style={{ textAlign: "start" as const, width: "100%" }}>
              <Badge
                color="grape"
                size="lg"
                styles={{ label: { fontSize: "var(--mantine-font-size-md)", fontWeight: 700 } }}
                variant="light"
              >
                {state.result.toeicMin} 〜 {state.result.toeicMax} 点
              </Badge>
            </Box>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

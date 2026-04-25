import { Badge, Box, Group, Progress, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

import type { ScoringState } from "~/features/essay-feedback/types/essay";

const STAGE_ORDER = ["idle", "score", "cefr", "toeic", "done"] as const;

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
    <Stack align="stretch" gap="lg">
      <Progress
        animated={state.stage !== "done"}
        aria-label="採点進捗"
        size="lg"
        value={progressValue}
      />
      <Stack align="stretch" gap="md">
        <ScoringRow label="点数">
          {state.result.score != null ? (
            <Text fw={700} size="xl" ta="start" w="100%">
              {state.result.score}点
            </Text>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          )}
        </ScoringRow>
        <ScoringRow label="総合評価">
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
        </ScoringRow>
        <ScoringRow label="CEFR レベル">
          {state.result.cefr != null ? (
            <Badge
              color="teal"
              size="lg"
              styles={{ label: { fontSize: "var(--mantine-font-size-md)", fontWeight: 700 } }}
              variant="light"
            >
              {state.result.cefr}
            </Badge>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          )}
        </ScoringRow>
        <ScoringRow label="TOEIC 推定スコア">
          {state.result.toeicMin != null && state.result.toeicMax != null ? (
            <Badge
              color="grape"
              size="lg"
              styles={{ label: { fontSize: "var(--mantine-font-size-md)", fontWeight: 700 } }}
              variant="light"
            >
              {state.result.toeicMin} 〜 {state.result.toeicMax} 点
            </Badge>
          ) : (
            <Text c="dimmed" size="md" ta="start">
              採点中...
            </Text>
          )}
        </ScoringRow>
      </Stack>
    </Stack>
  );
}

type ScoringRowProps = { children: ReactNode; label: string };

/**
 * ラベル列と値列の開始位置を揃え、左寄せ（`text-align: start`）で統一する。
 */
function ScoringRow({ children, label }: ScoringRowProps) {
  return (
    <Group align="flex-start" gap="md" justify="flex-start" w="100%" wrap="wrap">
      <Text fw={700} maw="100%" miw="10rem" size="md" style={{ flex: "0 0 auto" }}>
        {label}
      </Text>
      <Box
        style={{
          flex: "1 1 min(0, 100%)",
          minWidth: 0,
          textAlign: "left",
        }}
      >
        {children}
      </Box>
    </Group>
  );
}

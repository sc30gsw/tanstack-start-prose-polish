import { Badge, Group, Progress, Stack, Text } from "@mantine/core";

import type { ScoringState } from "~/features/essay-feedback/types/essay";

const STAGE_ORDER = ["idle", "score", "cefr", "toeic", "done"] as const;

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
      <Stack gap="sm">
        <ScoreRow
          label="点数"
          value={
            state.result.score != null ? (
              <Group gap="xs">
                <Text fw={700} size="xl">
                  {state.result.score}点
                </Text>
                {state.result.scoreFeedback != null && (
                  <Text c="dimmed" size="sm">
                    {state.result.scoreFeedback}
                  </Text>
                )}
              </Group>
            ) : null
          }
        />
        <ScoreRow
          label="CEFR レベル"
          value={
            state.result.cefr != null ? (
              <Badge color="teal" size="xl" variant="light">
                {state.result.cefr}
              </Badge>
            ) : null
          }
        />
        <ScoreRow
          label="TOEIC 推定スコア"
          value={
            state.result.toeicMin != null && state.result.toeicMax != null ? (
              <Badge color="grape" size="xl" variant="light">
                {state.result.toeicMin} 〜 {state.result.toeicMax} 点
              </Badge>
            ) : null
          }
        />
      </Stack>
    </Stack>
  );
}

function ScoreRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Group gap="md">
      <Text fw={500} w={160}>
        {label}
      </Text>
      {value != null ? value : <Text c="dimmed">採点中...</Text>}
    </Group>
  );
}

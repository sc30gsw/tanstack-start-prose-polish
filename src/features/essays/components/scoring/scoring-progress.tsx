import { Badge, Box, Group, Progress, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

import { TOPIC_RELEVANCE_META } from "~/features/essays/constants/essay";
import type { ScoringState } from "~/features/essays/types/essay";

const STAGE_ORDER = [
  "idle",
  "score",
  "cefr",
  "toeic",
  "topic",
  "done",
] as const satisfies readonly string[];

export function ScoringProgress({
  showTopicRelevance,
  state,
}: Record<"state", ScoringState> & Partial<Record<"showTopicRelevance", boolean>>) {
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
            <Text
              component="p"
              lh={1.65}
              m={0}
              size="md"
              ta="start"
              w="100%"
              className="wrap-break-words min-w-0"
            >
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
        {showTopicRelevance && (
          <ScoringRow label="テーマ適合">
            {state.result.topicRelevance != null ? (
              <Stack align="flex-start" gap={6}>
                <Badge
                  color={TOPIC_RELEVANCE_META[state.result.topicRelevance].color}
                  size="lg"
                  styles={{ label: { fontSize: "var(--mantine-font-size-md)", fontWeight: 700 } }}
                  variant="light"
                >
                  {TOPIC_RELEVANCE_META[state.result.topicRelevance].label}
                </Badge>
                {state.result.topicFeedback != null && state.result.topicFeedback.length > 0 && (
                  <Text
                    component="p"
                    lh={1.65}
                    m={0}
                    size="md"
                    ta="start"
                    w="100%"
                    className="wrap-break-words min-w-0"
                  >
                    {state.result.topicFeedback}
                  </Text>
                )}
              </Stack>
            ) : state.stage === "done" ? (
              //? 旧スコア（テーマ適合の保存なし）を hydrate した場合は判定なしを明示
              <Text c="dimmed" size="md" ta="start">
                —
              </Text>
            ) : (
              <Text c="dimmed" size="md" ta="start">
                判定中...
              </Text>
            )}
          </ScoringRow>
        )}
      </Stack>
    </Stack>
  );
}

type ScoringRowProps = { children: ReactNode; label: string };

function ScoringRow({ children, label }: ScoringRowProps) {
  return (
    <Group align="flex-start" gap="md" justify="flex-start" w="100%" wrap="wrap">
      <Text fw={700} maw="100%" miw="10rem" size="md" className="flex-0-auto flex-0">
        {label}
      </Text>
      <Box className="min-w-0 flex-1 text-left">{children}</Box>
    </Group>
  );
}

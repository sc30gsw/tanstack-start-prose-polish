import { Alert, Button, Container, Stack, Text } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "~/components/page-header";
import { db } from "~/db/instant";
import { useAuthUser } from "~/features/auth/hooks/use-auth-user";
import { persistEssayCorrection } from "~/features/essays/api/persist-essay-correction";
import { ScoringProgress } from "~/features/essays/components/scoring/scoring-progress";
import { useScoringStream } from "~/features/essays/hooks/scoring/use-scoring-stream";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";
import type { EssayMode, Score } from "~/features/essays/schemas/essay-schema";

export const Route = createFileRoute("/_authenticated/essays/$essayId/scoring")({
  component: ScoringPage,
});

function ScoringPage() {
  const { essayId } = Route.useParams();
  const { user } = useAuthUser();
  const { essay, isLoading } = useEssayDetail(essayId);
  const { error, hydrate, isPending, markFeedbackReady, start, state } = useScoringStream();
  const startedRef = useRef(false);
  const [correctionError, setCorrectionError] = useState<null | string>(null);
  const [isRetryingCorrection, setIsRetryingCorrection] = useState(false);

  const retryCorrection = useCallback(async () => {
    if (!essay?.bodyBefore || !user?.id) {
      return;
    }

    setIsRetryingCorrection(true);
    setCorrectionError(null);

    const txUpdate = db.tx.essays[essayId];
    if (txUpdate) {
      await db.transact(
        txUpdate.update({
          status: "scoring",
          updatedAt: new Date(),
        }),
      );
    }

    const result = await persistEssayCorrection({
      essayId,
      mode: essay.mode,
      prompt: essay.prompt,
      text: essay.bodyBefore,
      userId: user.id,
    });

    setIsRetryingCorrection(false);

    if (!result.ok) {
      setCorrectionError(result.error);
      return;
    }

    markFeedbackReady();
  }, [essay, essayId, markFeedbackReady, user?.id]);

  const retryScoring = useCallback(() => {
    if (!essay?.bodyBefore) {
      return;
    }

    start(essayId, essay.bodyBefore, {
      existingScoreId: essay.scoring?.id,
      mode: essay.mode as EssayMode,
      prompt: essay.prompt,
    });
  }, [essay, essayId, start]);

  useEffect(() => {
    if (!essay || startedRef.current) {
      return;
    }

    const { bodyBefore, mode, prompt, scoring, status } = essay;
    if (!bodyBefore) {
      return;
    }

    if (status === "correction_failed") {
      setCorrectionError("添削に失敗しました。再試行してください。");
      return;
    }

    if (scoring != null) {
      hydrate({
        cefr: scoring.cefr as Score["cefr"],
        score: scoring.score,
        scoreFeedback: scoring.scoreFeedback,
        toeicMax: scoring.toeicMax,
        toeicMin: scoring.toeicMin,
      });

      return;
    }

    startedRef.current = true;

    start(essayId, bodyBefore, {
      mode: mode as EssayMode,
      prompt,
    });
  }, [essay, essayId, hydrate, start]);

  useEffect(() => {
    if (!essay) {
      return;
    }

    if (essay.bodyAfter != null || essay.status === "reviewed") {
      markFeedbackReady();
    }
  }, [essay, markFeedbackReady]);

  if (isLoading) {
    return (
      <Container py="xl" size="md">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  if (!essay) {
    return (
      <Container py="xl" size="md">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="md">
      <PageHeader
        backLink={<Link to="/essays">学習履歴一覧</Link>}
        title={state.stage === "done" ? "採点結果" : "採点中..."}
      />
      <Stack gap="xl">
        {correctionError != null && (
          <Alert color="orange" title="添削に失敗しました" variant="light">
            <Stack align="flex-start" gap="sm">
              <Text size="md">{correctionError}</Text>
              <Button
                loading={isRetryingCorrection}
                onClick={() => void retryCorrection()}
                size="sm"
                variant="light"
              >
                添削を再試行
              </Button>
            </Stack>
          </Alert>
        )}
        {error != null && (
          <Alert color="red" title="採点に失敗しました" variant="light">
            <Stack align="flex-start" gap="sm">
              <Text size="md">{error}</Text>
              <Button onClick={retryScoring} size="sm" variant="light">
                再採点する
              </Button>
            </Stack>
          </Alert>
        )}
        <ScoringProgress state={state} />
        <Button
          aria-label="添削結果を確認"
          disabled={!state.feedbackReady || isPending}
          renderRoot={(props) => (
            <Link to="/essays/$essayId/diff" params={{ essayId }} {...props} />
          )}
        >
          添削結果を確認
        </Button>
      </Stack>
    </Container>
  );
}

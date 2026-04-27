import { Button, Container, Stack, Text } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { PageHeader } from "~/components/page-header";
import { ScoringProgress } from "~/features/essays/components/scoring/scoring-progress";
import { useScoringStream } from "~/features/essays/hooks/scoring/use-scoring-stream";
import { useEssayDetail } from "~/features/essays/hooks/shared/use-essay-detail";
import type { EssayMode, Score } from "~/features/essays/schemas/essay-schema";

export const Route = createFileRoute("/_authenticated/essays/$essayId/scoring")({
  component: ScoringPage,
});

function ScoringPage() {
  const { essayId } = Route.useParams();
  const { essay, isLoading } = useEssayDetail(essayId);
  const { state, start, hydrate, markFeedbackReady, isPending } = useScoringStream();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!essay || startedRef.current) {
      return;
    }

    const { bodyBefore, mode, prompt, scoring } = essay;
    if (!bodyBefore) {
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
    const controller = new AbortController();

    start(essayId, bodyBefore, controller.signal, {
      mode: mode as EssayMode,
      prompt,
    });

    return () => {
      controller.abort();
    };
  }, [essay, essayId, hydrate, start]);

  useEffect(() => {
    if (!essay) {
      return;
    }

    if (essay.status === "reviewed") {
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

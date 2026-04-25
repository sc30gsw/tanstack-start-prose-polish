import { Button, Container, Stack, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { PageHeader } from "~/components/page-header";
import { ScoringProgress } from "~/features/essay-feedback/components/scoring-progress";
import { useEssayDetail } from "~/features/essay-feedback/hooks/use-essay-detail";
import { useScoringStream } from "~/features/essay-feedback/hooks/use-scoring-stream";

export const Route = createFileRoute("/essays/$essayId/scoring")({
  component: ScoringPage,
});

function ScoringPage() {
  const { essayId } = Route.useParams();
  const navigate = useNavigate({ from: "/essays/$essayId/scoring" });
  const { essay, isLoading } = useEssayDetail(essayId);
  const { state, start, markFeedbackReady } = useScoringStream();
  const startedRef = useRef(false);

  useEffect(() => {
    if (essay == null || startedRef.current) return;

    const bodyBefore = (essay as { bodyBefore?: string }).bodyBefore;
    if (bodyBefore == null) return;

    startedRef.current = true;
    const controller = new AbortController();

    const essayMeta = essay as { mode?: string; prompt?: string; status?: string } | null;
    void start(bodyBefore, controller.signal, {
      mode: essayMeta?.mode,
      prompt: essayMeta?.prompt,
    }).then(() => {
      if (essayMeta?.status === "reviewed") {
        markFeedbackReady();
      }
    });

    return () => {
      controller.abort();
    };
  }, [essay, start, markFeedbackReady]);

  useEffect(() => {
    if (essay == null) return;
    const essayWithStatus = essay as { status?: string };
    if (essayWithStatus.status === "reviewed") markFeedbackReady();
  }, [essay, markFeedbackReady]);

  if (isLoading) {
    return (
      <Container py="xl" size="md">
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  if (essay == null) {
    return (
      <Container py="xl" size="md">
        <Text c="red">エッセイが見つかりませんでした。</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="md">
      <PageHeader
        backHref="/"
        backLabel="履歴一覧"
        title={state.stage === "done" ? "採点結果" : "採点中..."}
      />
      <Stack gap="xl">
        <ScoringProgress state={state} />
        <Button
          aria-label="添削結果を確認"
          disabled={!state.feedbackReady}
          onClick={() => {
            // @ts-expect-error TanStack Start augments @tanstack/react-start.Register but useNavigate reads @tanstack/router-core.Register; navigate works at runtime
            void navigate({ params: { essayId }, to: "/essays/$essayId/diff" });
          }}
          size="md"
        >
          添削結果を確認
        </Button>
      </Stack>
    </Container>
  );
}

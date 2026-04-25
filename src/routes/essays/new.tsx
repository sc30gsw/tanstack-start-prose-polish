import { id } from "@instantdb/react";
import { Alert, Button, Container, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as v from "valibot";

import { PageHeader } from "~/components/page-header";
import { correctEssay } from "~/features/essay-feedback/api/mock-ai";
import { DiverseModePrompt } from "~/features/essay-feedback/components/diverse-prompt";
import { EssayEditor } from "~/features/essay-feedback/components/essay-editor";
import { ModePicker } from "~/features/essay-feedback/components/mode-picker";
import { TopicPicker } from "~/features/essay-feedback/components/topic-picker";
import {
  essayDraftSchema,
  type EssayDraftInput,
} from "~/features/essay-feedback/schemas/essay-schema";
import { db, isInstantConfigured } from "~/lib/instant";

function selectBodyBefore(s: { values: EssayDraftInput }): string {
  return s.values.bodyBefore;
}

const EssayNewSearchSchema = v.object({
  mode: v.optional(v.picklist(["free", "topic", "diverse"]), "free"),
});

export const Route = createFileRoute("/essays/new")({
  component: EssayNewPage,
  validateSearch: (search) => v.parse(EssayNewSearchSchema, search),
});

function EssayNewPage() {
  const navigate = useNavigate({ from: "/essays/new" });
  const { mode } = Route.useSearch();

  const form = useForm({
    defaultValues: {
      bodyBefore: "",
      mode: mode,
      prompt: undefined as string | undefined,
    } satisfies EssayDraftInput,
    onSubmit: async ({ value }) => {
      const essayId = id();
      const now = new Date();

      const txEssay = db.tx.essays[essayId];
      if (txEssay == null) return;
      await db.transact(
        txEssay.update({
          bodyBefore: value.bodyBefore,
          createdAt: now,
          mode: value.mode,
          prompt: value.prompt,
          status: "scoring",
          updatedAt: now,
        }),
      );

      void correctEssay(value.bodyBefore, { mode: value.mode, prompt: value.prompt }).then(
        (result) => {
          result.match({
            err: () => {},
            ok: async ({ correctedBody, aiComments }) => {
              const txEssayUpdate = db.tx.essays[essayId];
              if (txEssayUpdate == null) return;
              await db.transact(
                txEssayUpdate.update({
                  bodyAfter: correctedBody,
                  status: "reviewed",
                  updatedAt: new Date(),
                }),
              );
              for (const comment of aiComments) {
                const commentId = id();
                const txComment = db.tx.diffComments[commentId];
                if (txComment == null) continue;
                await db.transact(
                  txComment
                    .update({
                      author: comment.author,
                      body: comment.body,
                      createdAt: new Date(),
                      lineNumber: comment.lineNumber,
                      side: comment.side,
                      suggestion: comment.suggestion,
                    })
                    .link({ essay: essayId }),
                );
              }
            },
          });
        },
      );

      await navigate({ params: () => ({ essayId }), to: "/essays/$essayId/scoring" });
    },
    validators: {
      onChange: ({ value }) => {
        const result = v.safeParse(essayDraftSchema, value);
        return result.success ? undefined : result.issues[0]?.message;
      },
    },
  });

  if (!isInstantConfigured) {
    return (
      <Container py="xl" size="md">
        <Alert color="orange" icon={<IconAlertCircle />} title="設定が必要です">
          <code>.env.local</code> に <code>VITE_INSTANT_APP_ID</code> を設定してください。InstantDB
          のダッシュボード（https://instantdb.com/dash）でアプリIDを取得できます。
        </Alert>
      </Container>
    );
  }

  return (
    <Container py="xl" size="md">
      <PageHeader backHref="/" backLabel="履歴一覧" title="新しい作文を始める" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <Stack gap="lg">
          <form.Field name="mode">{(field) => <ModePicker field={field} />}</form.Field>

          <form.Subscribe selector={(s) => s.values.mode}>
            {(currentMode) => (
              <>
                {currentMode === "topic" && (
                  <form.Field name="prompt">{(field) => <TopicPicker field={field} />}</form.Field>
                )}
                {currentMode === "diverse" && (
                  <form.Field name="prompt">
                    {(field) => (
                      <DiverseModePrompt onQuestionLoaded={(q) => field.handleChange(q)} />
                    )}
                  </form.Field>
                )}
              </>
            )}
          </form.Subscribe>

          <form.Field name="bodyBefore">
            {(field) => (
              <form.Subscribe selector={selectBodyBefore}>
                {(bodyBefore) => <EssayEditor bodyBeforeText={bodyBefore} field={field} />}
              </form.Subscribe>
            )}
          </form.Field>

          <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting, isValid: s.isValid })}>
            {({ isSubmitting, isValid }) => (
              <Button
                aria-label="送信して添削する"
                disabled={!isValid}
                loading={isSubmitting}
                size="md"
                type="submit"
              >
                送信して添削する
              </Button>
            )}
          </form.Subscribe>
        </Stack>
      </form>
    </Container>
  );
}

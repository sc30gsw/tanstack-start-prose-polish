import { id } from "@instantdb/react";
import { Button, Stack } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { getRouteApi } from "@tanstack/react-router";
import * as v from "valibot";

import { db } from "~/db/instant";
import { useAuthUser } from "~/features/auth/hooks/use-auth-user";
import { persistEssayCorrection } from "~/features/essays/api/persist-essay-correction";
import { DiverseModePrompt } from "~/features/essays/components/new/diverse-prompt";
import { EssayEditor } from "~/features/essays/components/new/essay-editor";
import { ModePicker } from "~/features/essays/components/new/mode-picker";
import { TopicPicker } from "~/features/essays/components/new/topic-picker";
import { essayDraftSchema, type EssayDraftInput } from "~/features/essays/schemas/essay-schema";

const routeApi = getRouteApi("/_authenticated/essays/new");

function selectBodyBefore(s: { values: EssayDraftInput }) {
  return s.values.bodyBefore;
}

export function EssayNewForm() {
  const { mode } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { user } = useAuthUser();

  const form = useForm({
    defaultValues: {
      bodyBefore: "",
      mode: mode,
      prompt: undefined as EssayDraftInput["prompt"],
    } satisfies EssayDraftInput,
    onSubmit: async ({ value }) => {
      if (!user?.id) {
        return;
      }

      const essayId = id();
      const now = new Date();

      const txEssay = db.tx.essays[essayId];

      if (!txEssay) {
        return;
      }

      const txEssayUpdate = txEssay.update({
        bodyBefore: value.bodyBefore,
        createdAt: now,
        mode: value.mode,
        prompt: value.prompt,
        status: "scoring",
        updatedAt: now,
      });

      await db.transact(txEssayUpdate.link({ owner: user.id }));

      void persistEssayCorrection({
        essayId,
        mode: value.mode,
        prompt: value.prompt,
        text: value.bodyBefore,
        userId: user.id,
      });

      await navigate({ params: () => ({ essayId }), to: "/essays/$essayId/scoring" });
    },
    validators: {
      onChange: ({ value }) => {
        const result = v.safeParse(essayDraftSchema, value);
        return result.success ? undefined : result.issues[0]?.message;
      },
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Stack gap="xl">
        <form.Field name="mode">{(field) => <ModePicker field={field} />}</form.Field>

        <form.Subscribe selector={(s) => s.values.mode}>
          {(currentMode) => (
            <>
              {currentMode === "topic" && (
                <form.Field name="prompt">{(field) => <TopicPicker field={field} />}</form.Field>
              )}

              {currentMode === "diverse" && (
                <form.Field name="prompt">
                  {(field) => <DiverseModePrompt onQuestionLoaded={(q) => field.handleChange(q)} />}
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
  );
}

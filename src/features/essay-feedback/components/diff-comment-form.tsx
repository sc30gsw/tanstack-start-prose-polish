import { Button, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";

import type { useDiffComments } from "~/features/essay-feedback/hooks/use-diff-comments";
import type { useDiffViewState } from "~/features/essay-feedback/hooks/use-diff-view-state";
import { diffCommentInputSchema } from "~/features/essay-feedback/schemas/essay-schema";

type DiffCommentFormProps = {
  closeAfterSubmit?: boolean;
  lineNumber: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["lineNumber"];
  onClose: () => void;
  onSubmit: ReturnType<typeof useDiffComments>["addComment"];
  side: NonNullable<ReturnType<typeof useDiffViewState>["aiLineModal"]>["side"];
  isPending: ReturnType<typeof useDiffComments>["isPending"];
};

export function DiffCommentForm({
  closeAfterSubmit = true,
  side,
  lineNumber,
  onSubmit,
  onClose,
}: DiffCommentFormProps) {
  const form = useForm({
    defaultValues: { body: "", lineNumber, side, suggestion: undefined as string | undefined },
    onSubmit: ({ value }) => {
      onSubmit(value);
      form.reset();

      if (closeAfterSubmit) {
        onClose();
      }
    },
    validators: {
      onChange: ({ value }) => {
        const result = v.safeParse(diffCommentInputSchema, value);

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
      <Stack gap="xs" p="xs">
        <form.Field name="body">
          {(field) => (
            <Textarea
              aria-label="コメント本文"
              autosize
              error={field.state.meta.errors[0]}
              minRows={2}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="コメントを入力..."
              value={field.state.value}
            />
          )}
        </form.Field>
        <Group gap="xs" justify="flex-end">
          <Button onClick={onClose} size="xs" variant="subtle">
            キャンセル
          </Button>
          <Button aria-label="コメントを追加" size="xs" type="submit">
            追加
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

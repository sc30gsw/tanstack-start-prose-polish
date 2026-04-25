import { Button, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";

import {
  diffCommentInputSchema,
  type DiffCommentInput,
} from "~/features/essay-feedback/schemas/essay-schema";

type DiffCommentFormProps = {
  lineNumber: number;
  onClose: () => void;
  onSubmit: (input: DiffCommentInput) => Promise<void>;
  side: "additions" | "deletions";
};

export function DiffCommentForm({ side, lineNumber, onSubmit, onClose }: DiffCommentFormProps) {
  const form = useForm({
    defaultValues: { body: "", lineNumber, side, suggestion: undefined as string | undefined },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
      form.reset();
      onClose();
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
        void form.handleSubmit();
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

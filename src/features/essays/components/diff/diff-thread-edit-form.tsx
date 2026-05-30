import { Stack, Textarea } from "@mantine/core";
import { Button, Group } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";

import type { useDiffComments } from "~/features/essays/hooks/diff/use-diff-comments";

const diffThreadEditFormSchema = v.object({
  body: v.pipe(v.string(), v.trim(), v.minLength(1, "コメントを入力してください")),
});

type DiffCommentThreadEditFormProps = {
  initialBody: ReturnType<typeof useDiffComments>["comments"][number]["body"];
  isPending: ReturnType<typeof useDiffComments>["isPending"];
  onCancel: () => void;
  onSave: (nextBody: ReturnType<typeof useDiffComments>["comments"][number]["body"]) => void;
};

export function DiffCommentThreadEditForm({
  initialBody,
  isPending,
  onCancel,
  onSave,
}: DiffCommentThreadEditFormProps) {
  const form = useForm({
    defaultValues: { body: initialBody },
    onSubmit: ({ value }) => {
      onSave(value.body);
    },
    validators: {
      onChange: ({ value }) => {
        const result = v.safeParse(diffThreadEditFormSchema, value);

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
      <Stack gap="xs">
        <form.Field name="body">
          {(field) => (
            <Textarea
              aria-label="コメントを編集"
              autosize
              disabled={isPending}
              error={field.state.meta.errors[0]}
              minRows={2}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onFocus={(e) => {
                const el = e.currentTarget;
                const end = el.value.length;
                el.setSelectionRange(end, end);
              }}
              value={field.state.value}
            />
          )}
        </form.Field>
        <Group gap="xs" justify="flex-end">
          <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting })}>
            {({ isSubmitting }) => (
              <Button
                disabled={isSubmitting || isPending}
                onClick={onCancel}
                size="xs"
                variant="default"
              >
                キャンセル
              </Button>
            )}
          </form.Subscribe>
          <form.Subscribe selector={(s) => ({ isValid: s.isValid, isSubmitting: s.isSubmitting })}>
            {({ isValid, isSubmitting }) => (
              <Button
                aria-label="編集を保存"
                disabled={!isValid || isSubmitting || isPending}
                loading={isSubmitting}
                size="xs"
                type="submit"
              >
                保存
              </Button>
            )}
          </form.Subscribe>
        </Group>
      </Stack>
    </form>
  );
}

import { Stack, Textarea } from "@mantine/core";

import { CharCounter } from "~/features/essays/components/new/char-counter";

type EssayEditorProps = {
  /**
   * `form.Subscribe` で `s.values.bodyBefore` を渡す。`form.Field` 内の `field.state.value` だけに依存すると
   *（React Compiler 等）文字数表示が追従しないことがある。
   */
  bodyBeforeText: string;
  field: {
    handleBlur: () => void;
    handleChange: (value: string) => void;
    state: { meta: { errors: (string | undefined)[] }; value: string };
  };
};

export function EssayEditor({ bodyBeforeText, field }: EssayEditorProps) {
  return (
    <Stack gap="xs">
      <Textarea
        aria-label="英文本文"
        autosize
        error={field.state.meta.errors[0]}
        label="英文を入力してください"
        minRows={10}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.currentTarget.value)}
        placeholder="Write your essay here..."
        size="md"
        value={field.state.value}
      />
      <CharCounter value={bodyBeforeText} />
    </Stack>
  );
}

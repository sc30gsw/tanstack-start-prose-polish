import { SegmentedControl, Stack, Text } from "@mantine/core";

import type { EssayMode } from "~/features/essay-feedback/schemas/essay-schema";

const MODE_OPTIONS = [
  { label: "自由作文", value: "free" },
  { label: "トピック選択", value: "topic" },
  { label: "多様なお題", value: "diverse" },
] satisfies { label: string; value: EssayMode }[];

const MODE_DESCRIPTIONS = {
  free: "テーマを自由に決めて英文を書きます。",
  diverse: "仮定・文化・意見など、AI が示す幅広い問いに英文で答えます。",
  topic: "AI が提示する 3 つのトピックから 1 つを選び、英文で論じます。",
} as const satisfies Record<EssayMode, string>;

type ModePickerProps = {
  field: {
    handleChange: (value: EssayMode) => void;
    state: { meta: { errors: (string | undefined)[] }; value: EssayMode };
  };
};

export function ModePicker({ field }: ModePickerProps) {
  return (
    <Stack gap="sm">
      <SegmentedControl
        aria-label="作文モード"
        data={MODE_OPTIONS}
        onChange={(value) => field.handleChange(value as EssayMode)}
        value={field.state.value}
      />
      <Text lh={1.65} size="md">
        {MODE_DESCRIPTIONS[field.state.value as keyof typeof MODE_DESCRIPTIONS]}
      </Text>
    </Stack>
  );
}

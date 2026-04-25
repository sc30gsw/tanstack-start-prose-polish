import { Text } from "@mantine/core";
import { useMemo } from "react";

import { MAX_ESSAY_BODY_CHARS } from "~/features/essay-feedback/constants/essay";

type CharCounterProps = {
  value: string;
};

export function CharCounter({ value }: CharCounterProps) {
  // `v.maxLength` と同じく `String#length`（Valibot 既定）
  const count = useMemo(() => value.length, [value]);

  const color = count > 9500 ? "red" : count > 8000 ? "orange" : "green";

  return (
    <Text c={color} size="xs" ta="right">
      {count.toLocaleString()} / {MAX_ESSAY_BODY_CHARS.toLocaleString()} 文字
    </Text>
  );
}

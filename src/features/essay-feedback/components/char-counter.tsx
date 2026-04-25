import { Text } from "@mantine/core";
import { useMemo } from "react";

import { MAX_ESSAY_BODY_CHARS } from "~/features/essay-feedback/constants/essay";

type CharCounterProps = {
  value: string;
};

export function CharCounter({ value }: CharCounterProps) {
  // `v.maxLength` と同じく `String#length`（Valibot 既定）
  const count = useMemo(() => value.length, [value]);

  const isCritical = count > 9500;
  const isWarning = count > 8000;
  // 3 段階の意味色（.7 はライト背景でも十分なコントラストになりやすい）
  const color = isCritical ? "red.7" : isWarning ? "orange.7" : "green.7";

  return (
    <Text c={color} fw={500} size="sm" ta="right">
      {count.toLocaleString()} / {MAX_ESSAY_BODY_CHARS.toLocaleString()} 文字
    </Text>
  );
}

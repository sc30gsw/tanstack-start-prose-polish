import { expect, test } from "vite-plus/test";

import { topicPrompt } from "~/features/essays/utils/topic-prompt";

test("topic モードはお題を返す", () => {
  expect(topicPrompt("topic", "Should AI have legal rights?")).toBe("Should AI have legal rights?");
});

test("diverse モードもお題を返す", () => {
  expect(topicPrompt("diverse", "Imagine a world without money.")).toBe(
    "Imagine a world without money.",
  );
});

test("free モードは null", () => {
  expect(topicPrompt("free", "anything")).toBeNull();
});

test("お題が undefined / 空文字なら null", () => {
  expect(topicPrompt("topic", undefined)).toBeNull();
  expect(topicPrompt("diverse", "")).toBeNull();
});

test("mode が undefined なら null", () => {
  expect(topicPrompt(undefined, "anything")).toBeNull();
});

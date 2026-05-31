import { describe, expect, test } from "vite-plus/test";

import {
  normalizeCorrectedBody,
  resolveComments,
} from "~/features/essays/utils/correction-comment-resolution";

describe("normalizeCorrectedBody", () => {
  test("appends newline when unchanged so diff hunks render", () => {
    expect(normalizeCorrectedBody("hello", "hello")).toBe("hello\n");
  });

  test("keeps changed text as-is", () => {
    expect(normalizeCorrectedBody("Hello", "hello")).toBe("Hello");
  });
});

describe("resolveComments", () => {
  test("maps snippet to line number in corrected body", () => {
    const comments = resolveComments(
      {
        comments: [
          {
            body: "Grammar",
            snippet: "world",
            suggestion: "Use World",
          },
        ],
      },
      "hello\nworld",
    );

    expect(comments).toEqual([
      {
        body: "Grammar",
        lineNumber: 2,
        side: "additions",
        suggestion: "Use World",
      },
    ]);
  });

  test("skips comments when snippet is missing from corrected body", () => {
    const comments = resolveComments(
      {
        comments: [{ body: "Missing", snippet: "not-here" }],
      },
      "hello",
    );

    expect(comments).toEqual([]);
  });
});

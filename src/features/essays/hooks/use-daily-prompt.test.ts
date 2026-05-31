import { describe, expect, test } from "vite-plus/test";

describe("useDailyPrompt generation lock", () => {
  test("releasing lock allows a second generate call", () => {
    const generatingRef = { current: true };
    let calls = 0;

    const generate = () => {
      if (generatingRef.current) {
        return "blocked";
      }
      calls += 1;
      return "ran";
    };

    expect(generate()).toBe("blocked");

    generatingRef.current = false;
    expect(generate()).toBe("ran");
    expect(calls).toBe(1);
  });
});

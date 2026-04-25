import * as v from "valibot";

const essaysModeSchema = v.union([
  v.literal("all"),
  v.literal("free"),
  v.literal("topic"),
  v.literal("diverse"),
]);

export const defaultEssaysSearchParams = {
  q: "",
  mode: "all",
  page: 1,
} as const;

export const essaysSearchSchema = v.object({
  mode: v.optional(essaysModeSchema, defaultEssaysSearchParams.mode),
  q: v.optional(v.string(), defaultEssaysSearchParams.q),
  page: v.optional(v.number(), defaultEssaysSearchParams.page),
});

export type EssaysModeFilter = v.InferOutput<typeof essaysModeSchema>;
export type EssaysSearchParams = v.InferOutput<typeof essaysSearchSchema>;

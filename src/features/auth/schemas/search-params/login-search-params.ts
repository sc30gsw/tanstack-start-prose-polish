import * as v from "valibot";

export const loginSearchParamsSchema = v.object({
  returnTo: v.optional(v.string()),
});

export type LoginSearchParams = v.InferOutput<typeof loginSearchParamsSchema>;

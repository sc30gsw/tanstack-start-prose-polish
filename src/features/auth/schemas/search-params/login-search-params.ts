import * as v from "valibot";

export const defaultLoginSearchParams = {
  returnTo: "",
  mode: "signin",
} as const satisfies { returnTo: string; mode: "signin" | "signup" };

export const loginSearchParamsSchema = v.object({
  returnTo: v.optional(v.string()),
  mode: v.optional(v.picklist(["signin", "signup"], defaultLoginSearchParams.mode)),
});

export type LoginSearchParams = v.InferOutput<typeof loginSearchParamsSchema>;

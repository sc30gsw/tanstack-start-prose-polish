import { i } from "@instantdb/react";

export const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
      username: i.string().optional(),
    }),
    essays: i.entity({
      bodyAfter: i.string().optional().indexed(),
      bodyBefore: i.string().indexed(),
      cefr: i.string().optional(),
      createdAt: i.date().indexed(),
      mode: i.string().indexed(),
      prompt: i.string().optional().indexed(),
      score: i.number().optional(),
      scoreFeedback: i.string().optional(),
      status: i.string(),
      toeicMax: i.number().optional(),
      toeicMin: i.number().optional(),
      updatedAt: i.date(),
    }),
    diffComments: i.entity({
      body: i.string(),
      createdAt: i.date(),
      kind: i.string().indexed(),
      lineNumber: i.number(),
      side: i.string(),
      suggestion: i.string().optional(),
      updatedAt: i.date().optional(),
      userId: i.string().indexed(),
    }),
  },
  links: {
    essayComments: {
      forward: { has: "one", label: "essay", on: "diffComments" },
      reverse: { has: "many", label: "comments", on: "essays" },
    },
    essayOwner: {
      forward: { has: "one", label: "owner", on: "essays" },
      reverse: { has: "many", label: "essays", on: "$users" },
    },
  },
});

export type AppSchema = typeof schema;

export default schema;

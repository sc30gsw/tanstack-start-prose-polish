import { i } from "@instantdb/react";

export const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
      username: i.string().optional(),
    }),
    dailyPrompts: i.entity({
      createdAt: i.date(),
      dateKey: i.string().indexed(),
      mode: i.string().indexed(),
      payload: i.json(),
      userId: i.string().indexed(),
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
    essays: i.entity({
      /** 最大 10,000 文字。indexed にすると InstantDB の上限を超えるため index しない */
      bodyAfter: i.string().optional(),
      bodyBefore: i.string(),
      createdAt: i.date().indexed(),
      mode: i.string().indexed(),
      prompt: i.string().optional(),
      status: i.string(),
      updatedAt: i.date(),
    }),
    scores: i.entity({
      cefr: i.string(),
      score: i.number(),
      scoreFeedback: i.string(),
      toeicMax: i.number(),
      toeicMin: i.number(),
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
    essayScore: {
      forward: { has: "one", label: "scoring", on: "essays" },
      reverse: { has: "one", label: "essay", on: "scores" },
    },
  },
});

export type AppSchema = typeof schema;

export default schema;

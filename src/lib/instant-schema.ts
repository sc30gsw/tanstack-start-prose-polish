import { i } from "@instantdb/react";

export const schema = i.schema({
  entities: {
    essays: i.entity({
      bodyAfter: i.string().optional(),
      bodyBefore: i.string(),
      cefr: i.string().optional(),
      createdAt: i.date(),
      mode: i.string(),
      prompt: i.string().optional(),
      score: i.number().optional(),
      scoreFeedback: i.string().optional(),
      status: i.string(),
      toeicMax: i.number().optional(),
      toeicMin: i.number().optional(),
      updatedAt: i.date(),
    }),
    diffComments: i.entity({
      author: i.string(),
      body: i.string(),
      createdAt: i.date(),
      lineNumber: i.number(),
      side: i.string(),
      suggestion: i.string().optional(),
      updatedAt: i.date().optional(),
    }),
  },
  links: {
    essayComments: {
      forward: { has: "one", label: "essay", on: "diffComments" },
      reverse: { has: "many", label: "comments", on: "essays" },
    },
  },
});

export type AppSchema = typeof schema;

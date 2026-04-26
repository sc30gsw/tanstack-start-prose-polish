import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      create: "true",
      delete: "false",
      update: "false",
      view: "auth.id == data.id",
    },
  },
  attrs: {
    allow: {
      create: "false",
    },
  },
  diffComments: {
    allow: {
      create: "auth.id != null && auth.id in newData.ref('essay.owner.id')",
      delete: "auth.id != null && data.kind == 'user' && auth.id == data.userId",
      update: "auth.id != null && data.kind == 'user' && auth.id == data.userId",
      view: "auth.id != null && auth.id in data.ref('essay.owner.id')",
    },
  },
  essays: {
    allow: {
      create: "auth.id != null && auth.id in newData.ref('owner.id')",
      delete: "auth.id != null && auth.id in data.ref('owner.id')",
      update: "auth.id != null && auth.id in data.ref('owner.id')",
      view: "auth.id != null && auth.id in data.ref('owner.id')",
    },
  },
} satisfies InstantRules;

export default rules;

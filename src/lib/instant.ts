import { init } from "@instantdb/react";

import { schema } from "~/lib/instant-schema";

const appId = import.meta.env.VITE_INSTANT_APP_ID;

export const db = init({
  appId,
  schema,
});

export const isInstantConfigured = Boolean(appId && appId !== "demo-app-id");

import { init } from "@instantdb/admin";

import { schema } from "~/lib/instant-schema";

export const adminDb = init({
  adminToken: import.meta.env.INSTANT_APP_ADMIN_TOKEN,
  appId: import.meta.env.VITE_INSTANT_APP_ID,
  schema,
});

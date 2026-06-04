import { init } from "@instantdb/admin";

import schema from "~/db/instant-schema";

export const adminDb = init({
  //! admin token は権限バイパスの秘密情報。VITE_ プレフィックス（クライアント露出）禁止
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN,
  appId: import.meta.env.VITE_INSTANT_APP_ID,
  schema,
});

import type { User } from "@instantdb/react";

import type { adminDb } from "~/db/instant-admin";

let refreshToken: null | User["refresh_token"] = null;

export function setInstantRefreshToken(
  token: null | Parameters<typeof adminDb.auth.verifyToken>[0],
) {
  refreshToken = token;
}

export function getInstantRefreshToken() {
  return refreshToken;
}

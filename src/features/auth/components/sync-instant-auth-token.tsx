import { useEffect } from "react";

import { db } from "~/db/instant";
import { setInstantRefreshToken } from "~/features/auth/server/instant-refresh-token-store";

//! Keeps the latest Instant refresh token available for authenticated server fn calls.
export function SyncInstantAuthToken() {
  const { user } = db.useAuth();

  useEffect(() => {
    setInstantRefreshToken(user?.refresh_token ?? null);
    return () => setInstantRefreshToken(null);
  }, [user?.refresh_token]);

  return null;
}

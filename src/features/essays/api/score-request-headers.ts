import { INSTANT_REFRESH_TOKEN_HEADER } from "~/features/auth/constants/instant-auth";
import { getInstantRefreshToken } from "~/features/auth/server/instant-refresh-token-store";

export function buildScoreRequestHeaders() {
  const token = getInstantRefreshToken();
  if (!token) {
    return undefined;
  }

  return { [INSTANT_REFRESH_TOKEN_HEADER]: token };
}

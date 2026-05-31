import { Result } from "better-result";

import { adminDb } from "~/db/instant-admin";
import { INSTANT_REFRESH_TOKEN_HEADER } from "~/features/auth/constants/instant-auth";
import { AuthError } from "~/features/auth/types/auth-error";

export function getRefreshTokenFromRequest(request: Request) {
  const headerToken = request.headers.get(INSTANT_REFRESH_TOKEN_HEADER)?.trim();

  if (headerToken) {
    return headerToken;
  }

  const authorization = request.headers.get("Authorization")?.trim();

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
}

export async function verifyInstantUser(token: Parameters<typeof adminDb.auth.verifyToken>[0]) {
  return adminDb.auth.verifyToken(token);
}

export async function requireInstantUser(request: Request) {
  const token = getRefreshTokenFromRequest(request);

  if (!token) {
    return Result.err(new AuthError({ message: "Unauthorized", reason: "missing" }));
  }

  return Result.tryPromise({
    catch: (e) => new AuthError({ cause: e, message: "Unauthorized", reason: "invalid" }),
    try: () => verifyInstantUser(token),
  });
}

export function unauthorizedResponse() {
  return new Response("Unauthorized", { status: 401 });
}

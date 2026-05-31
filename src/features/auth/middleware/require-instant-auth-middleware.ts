import type { User } from "@instantdb/admin";
import { createMiddleware } from "@tanstack/react-start";

import { INSTANT_REFRESH_TOKEN_HEADER } from "~/features/auth/constants/instant-auth";
import { getInstantRefreshToken } from "~/features/auth/server/instant-refresh-token-store";
import {
  getRefreshTokenFromRequest,
  unauthorizedResponse,
  verifyInstantUser,
} from "~/features/auth/server/verify-instant-user";

export type AuthenticatedServerContext = Record<"user", User>;

export const instantAuthRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next, request }) => {
    const token = getRefreshTokenFromRequest(request);
    if (!token) {
      return unauthorizedResponse();
    }

    try {
      const user = await verifyInstantUser(token);
      return next({ context: { instantUser: user } });
    } catch {
      return unauthorizedResponse();
    }
  },
);

export const requireInstantAuthMiddleware = createMiddleware({ type: "function" })
  .middleware([instantAuthRequestMiddleware])
  .client(async ({ next }) => {
    const token = getInstantRefreshToken();
    if (!token) {
      throw new Error("ログインが必要です");
    }

    return next({
      headers: {
        [INSTANT_REFRESH_TOKEN_HEADER]: token,
      },
    });
  })
  .server(async ({ context, next }) => {
    const user = (context as { instantUser?: User }).instantUser;
    if (!user) {
      throw unauthorizedResponse();
    }

    return next({
      context: { user } satisfies AuthenticatedServerContext,
    });
  });

import type { getRouter } from "./router";

declare module "@tanstack/router-core" {
  interface Register {
    router: Awaited<ReturnType<typeof getRouter>>;
  }
}

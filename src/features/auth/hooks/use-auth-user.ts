import { db } from "~/lib/instant";

export function useAuthUser() {
  return db.useAuth();
}

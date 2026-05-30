import { db } from "~/db/instant";

export function useAuthUser() {
  return db.useAuth();
}

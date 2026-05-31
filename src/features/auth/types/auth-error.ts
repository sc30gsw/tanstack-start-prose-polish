import { TaggedError } from "better-result";

export class AuthError extends TaggedError("AuthError")<{
  cause?: unknown;
  message: string;
  reason?: "invalid" | "missing";
}>() {}

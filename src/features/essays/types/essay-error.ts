import { TaggedError } from "better-result";

export class EssayAiError extends TaggedError("EssayAiError")<{
  cause?: unknown;
  message: string;
}>() {}

export class EssayPersistenceError extends TaggedError("EssayPersistenceError")<{
  cause?: unknown;
  message: string;
}>() {}

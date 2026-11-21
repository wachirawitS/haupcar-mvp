import { z } from "zod";

export const DEFAULT_AFTER_LOGIN_PATH = "/cars";

// `?next=` after login: only a same-site path, never another origin (open redirect).
// "//evil.com" and "/\evil.com" are treated by browsers as other origins.
export const nextPathSchema = z
  .string()
  .refine((path) => path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\"))
  .refine((path) => !path.startsWith("/login"))
  .catch(DEFAULT_AFTER_LOGIN_PATH);

import { z } from "zod";
import { AUTH_MESSAGES } from "../messages";

// Mirrors LoginDto: required, max 200. Values are sent as typed (no trimming).
const CREDENTIAL_MAX_LENGTH = 200;

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, AUTH_MESSAGES.usernameRequired)
    .max(CREDENTIAL_MAX_LENGTH, AUTH_MESSAGES.tooLong),
  password: z
    .string()
    .min(1, AUTH_MESSAGES.passwordRequired)
    .max(CREDENTIAL_MAX_LENGTH, AUTH_MESSAGES.tooLong),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

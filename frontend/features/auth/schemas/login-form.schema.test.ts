import { describe, expect, it } from "vitest";
import { AUTH_MESSAGES } from "../messages";
import { loginFormSchema } from "./login-form.schema";

describe("loginFormSchema", () => {
  it("accepts a username and password and keeps them as typed", () => {
    const result = loginFormSchema.parse({ username: " somchai ", password: "p@ss " });
    expect(result).toEqual({ username: " somchai ", password: "p@ss " });
  });

  it("requires both fields with Thai messages", () => {
    const result = loginFormSchema.safeParse({ username: "", password: "" });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual([AUTH_MESSAGES.usernameRequired, AUTH_MESSAGES.passwordRequired]);
  });

  it("rejects values longer than the API limit (200)", () => {
    const result = loginFormSchema.safeParse({ username: "a".repeat(201), password: "x" });
    expect(result.success).toBe(false);
  });
});

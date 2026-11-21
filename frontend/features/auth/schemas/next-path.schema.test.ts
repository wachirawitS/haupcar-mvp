import { describe, expect, it } from "vitest";
import { DEFAULT_AFTER_LOGIN_PATH, nextPathSchema } from "./next-path.schema";

describe("nextPathSchema", () => {
  it("keeps a same-site path with its query", () => {
    expect(nextPathSchema.parse("/cars/1/edit?tab=images")).toBe("/cars/1/edit?tab=images");
  });

  it.each([
    ["empty", ""],
    ["absolute URL", "https://evil.com"],
    ["protocol-relative", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["relative path", "cars"],
    ["the login page itself", "/login?next=/cars"],
    ["not a string", 42],
  ])("falls back to /cars for %s", (_label, value) => {
    expect(nextPathSchema.parse(value)).toBe(DEFAULT_AFTER_LOGIN_PATH);
  });
});

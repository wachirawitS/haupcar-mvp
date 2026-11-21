import { describe, expect, it } from "vitest";
import { ApiError, UNKNOWN_ERROR, toApiError } from "./api-error";

describe("toApiError", () => {
  it("keeps code, message and fieldErrors from the backend error body", () => {
    const error = toApiError(422, {
      statusCode: 422,
      code: "VALIDATION_FAILED",
      message: "The request contains invalid fields",
      fieldErrors: { brand: [{ code: "REQUIRED", message: "brand is required" }] },
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.fieldErrors?.brand?.[0]?.code).toBe("REQUIRED");
  });

  it("falls back to UNKNOWN_ERROR when the body is not the backend shape", () => {
    const error = toApiError(502, "<html>Bad Gateway</html>");

    expect(error.statusCode).toBe(502);
    expect(error.code).toBe(UNKNOWN_ERROR);
  });
});

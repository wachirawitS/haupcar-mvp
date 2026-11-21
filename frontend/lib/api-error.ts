import { z } from "zod";

export type FieldError = { code: string; message: string };
export type FieldErrors = Record<string, FieldError[]>;

// Backend error body (backend §7.1).
const errorBodySchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
  fieldErrors: z
    .record(z.string(), z.array(z.object({ code: z.string(), message: z.string() })))
    .optional(),
});

export const NETWORK_ERROR = "NETWORK_ERROR";
export const UNKNOWN_ERROR = "UNKNOWN_ERROR";

// One typed error for every failed API call. UI branches on `code` only.
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(statusCode: number, body: unknown): ApiError {
  const parsed = errorBodySchema.safeParse(body);
  if (!parsed.success) {
    return new ApiError(statusCode, UNKNOWN_ERROR, "Unexpected error response");
  }
  const { code, message, fieldErrors } = parsed.data;
  return new ApiError(statusCode, code, message, fieldErrors);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

import { ApiError, NETWORK_ERROR, toApiError } from "./api-error";
import { clearToken, getToken } from "./auth-token";
import { env } from "./env";
import { getQueryClient } from "./query-client";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
type QueryValue = string | number | boolean | undefined;

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  // Login handles its own 401 (INVALID_CREDENTIALS); skip the global redirect.
  skipAuthRedirect?: boolean;
};

const LOGIN_PATH = "/login";

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function buildInit(options: RequestOptions): RequestInit {
  const headers = new Headers({ Accept: "application/json" });
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    // Let the browser set multipart Content-Type with its boundary.
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  return { method: options.method ?? "GET", headers, body, signal: options.signal };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function handleUnauthorized(): void {
  clearToken();
  getQueryClient().clear();
  if (typeof window === "undefined") return;
  // Come back to the same page after logging in again.
  const { pathname, search } = window.location;
  const next = encodeURIComponent(`${pathname}${search}`);
  // Outside React there is no router; a full navigation also drops any in-memory state.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${LOGIN_PATH}?next=${next}`);
}

// The one HTTP client (§3). Components never call fetch directly.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), buildInit(options));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, NETWORK_ERROR, "Network request failed");
  }

  if (response.status === 204) return undefined as T;

  const body = await readJson(response);
  if (response.ok) return body as T;

  const apiError = toApiError(response.status, body);
  if (response.status === 401 && !options.skipAuthRedirect) handleUnauthorized();
  throw apiError;
}

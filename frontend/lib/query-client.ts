import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "./api-error";

const MAX_QUERY_RETRIES = 2;

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Never retry 4xx: the request itself is wrong (§4).
        retry: (failureCount, error) =>
          !(isApiError(error) && error.statusCode >= 400 && error.statusCode < 500) &&
          failureCount < MAX_QUERY_RETRIES,
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// Server: a new client per request. Browser: one shared client.
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

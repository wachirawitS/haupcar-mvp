// The only place that touches localStorage for the auth token (ADR-0011, §3).
const TOKEN_KEY = "haupcar.accessToken";

function hasStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function getToken(): string | null {
  return hasStorage() ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string): void {
  if (hasStorage()) window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (hasStorage()) window.localStorage.removeItem(TOKEN_KEY);
}

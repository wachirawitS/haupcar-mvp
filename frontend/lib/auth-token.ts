// The only place that touches localStorage for the auth token (ADR-0011, §3).
const TOKEN_KEY = "haupcar.accessToken";

const listeners = new Set<() => void>();

function hasStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function getToken(): string | null {
  return hasStorage() ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function setToken(token: string): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  notify();
}

export function clearToken(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  notify();
}

// For useSyncExternalStore: fires on login/logout in this tab and in other tabs.
export function subscribeToken(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

import { useSyncExternalStore } from "react";
import { getToken, subscribeToken } from "@/lib/auth-token";

const hasToken = () => getToken() !== null;

// Live login state. Do not copy it into useState: Next.js keeps visited pages
// alive with <Activity>, so a copied value goes stale when the page is shown again.
export function useIsLoggedIn(): boolean {
  return useSyncExternalStore(subscribeToken, hasToken, () => false);
}

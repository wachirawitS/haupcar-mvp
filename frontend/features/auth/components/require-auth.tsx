"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, use, useEffect, useState } from "react";
import { browser } from "react-dom";
import { getToken } from "@/lib/auth-token";

// Guards the /cars pages. The token lives in localStorage, so this renders only in the browser.
// An expired token is caught by the API client's 401 handling (§3.1).
export function RequireAuth({ children }: { children: ReactNode }) {
  use(browser("The auth token is stored in localStorage."));

  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  // Read once on mount, so logging out does not race this redirect.
  const [hasToken] = useState(() => getToken() !== null);

  useEffect(() => {
    if (hasToken) return;
    const current = search ? `${pathname}?${search}` : pathname;
    router.replace(`/login?next=${encodeURIComponent(current)}`);
  }, [hasToken, pathname, search, router]);

  return hasToken ? children : null;
}

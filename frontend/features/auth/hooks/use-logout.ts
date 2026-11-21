import { useQueryClient } from "@tanstack/react-query";
import { clearToken } from "@/lib/auth-token";

// Logout is client-side only (§3): drop the token and cached data.
// RequireAuth sees the token is gone and redirects to /login.
export function useLogout(): () => void {
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
  };
}

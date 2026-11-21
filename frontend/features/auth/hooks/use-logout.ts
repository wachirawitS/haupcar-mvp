import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth-token";

// Logout is client-side only (§3): drop the token and cached data, then go to /login.
export function useLogout(): () => void {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    router.replace("/login");
  };
}

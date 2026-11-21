import { useMutation } from "@tanstack/react-query";
import { setToken } from "@/lib/auth-token";
import { login } from "../api/auth-api";

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken }) => setToken(accessToken),
  });
}

import { apiRequest } from "@/lib/api-client";
import type { LoginRequest, LoginResponse } from "../types";

export function login(body: LoginRequest): Promise<LoginResponse> {
  // A 401 here means wrong credentials, not an expired session.
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body,
    skipAuthRedirect: true,
  });
}

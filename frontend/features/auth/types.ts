// Wire types for POST /auth/login (backend §6.2).
export type LoginRequest = { username: string; password: string };
export type LoginResponse = { accessToken: string; expiresIn: number };

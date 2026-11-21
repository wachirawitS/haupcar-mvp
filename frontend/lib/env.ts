import { z } from "zod";

const envSchema = z.object({
  // Public: the browser calls the API directly. Never put secrets in NEXT_PUBLIC_*.
  NEXT_PUBLIC_API_URL: z.url(),
});

// Reference each variable literally so Next.js can inline it at build time.
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

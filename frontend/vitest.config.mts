import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pure-logic unit tests only (§8.1b): no jsdom, no component tests.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    env: { NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1" },
  },
});

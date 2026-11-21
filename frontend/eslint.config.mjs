import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Convention §2: rules enforced mechanically. Boundary rules stay review-only.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Named exports only. Default exports only in Next.js special files (§2.2).",
        },
        { selector: "TSEnumDeclaration", message: "No TypeScript enum. Use a const object + union." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "localStorage", message: "Use lib/auth-token.ts (§3)." },
      ],
    },
  },
  {
    // Next.js special files and config files require a default export.
    files: [
      "app/**/{page,layout,error,not-found,loading,template,default,global-error}.tsx",
      "*.config.{ts,mts,mjs}",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["lib/auth-token.ts"],
    rules: { "no-restricted-properties": "off" },
  },
  {
    // shadcn components are copied as-is; keep them easy to update.
    files: ["components/ui/**"],
    rules: { "@typescript-eslint/consistent-type-imports": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;

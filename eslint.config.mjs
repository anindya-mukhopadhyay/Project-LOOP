import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "public/**",
      "prisma/migrations/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["components/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}", "providers/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/database", "@/lib/database/*", "@/repositories", "@/repositories/*"],
              message:
                "UI, provider, and hook layers must not depend on persistence. Route through server boundaries and services instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["repositories/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/components", "@/components/*", "@/services", "@/services/*"],
              message:
                "Repositories are persistence adapters and must not depend on UI, routes, or business services.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["services/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/components", "@/components/*"],
              message: "Services must remain UI-agnostic and callable from route handlers or jobs.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;

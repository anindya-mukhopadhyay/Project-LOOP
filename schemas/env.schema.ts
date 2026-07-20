import { z } from "zod";

const requiredInProduction = ["DATABASE_URL", "AUTH_SECRET", "NEXTAUTH_URL"] as const;

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Project LOOP"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1).optional(),
    AUTH_SECRET: z.string().min(32).optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    SKIP_ENV_VALIDATION: z
      .string()
      .optional()
      .transform((value) => value === "1" || value === "true"),
  })
  .superRefine((env, context) => {
    if (env.SKIP_ENV_VALIDATION || env.NODE_ENV !== "production") {
      return;
    }

    for (const key of requiredInProduction) {
      if (!env[key]) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required in production.`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${message}`);
  }

  return parsed.data;
}

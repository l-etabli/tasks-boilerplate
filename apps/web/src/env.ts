import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const environmentSchema = z
  .enum(["local", "development", "staging", "production"])
  .default("local");

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    ENVIRONMENT: environmentSchema,
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),
    SENTRY_DSN: z.url().optional(),
  },

  clientPrefix: "VITE_",

  client: {
    VITE_BETTER_AUTH_URL: z.url().optional(),
    VITE_ENVIRONMENT: environmentSchema,
  },

  runtimeEnv: typeof window === "undefined" ? process.env : import.meta.env,

  emptyStringAsUndefined: true,
});

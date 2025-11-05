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
    EMAIL_GATEWAY: z.enum(["inMemory", "resend"]).default("inMemory"),
    EMAIL_RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.email().optional(),
    SENTRY_DSN: z.url().optional(),
  },

  clientPrefix: "VITE_",

  client: {
    VITE_BETTER_AUTH_URL: z.url().optional(),
    VITE_ENVIRONMENT: environmentSchema,
    VITE_UMAMI_WEBSITE_ID: z.string().optional(),
    VITE_UMAMI_SCRIPT_URL: z.url().optional(),
  },

  runtimeEnv: typeof window === "undefined" ? process.env : import.meta.env,

  emptyStringAsUndefined: true,
});

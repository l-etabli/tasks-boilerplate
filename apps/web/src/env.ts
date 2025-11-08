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
    UMAMI_WEBSITE_ID: z.string().optional(),
    UMAMI_SCRIPT_URL: z.url().optional(),
  },

  clientPrefix: "VITE_",

  client: {},

  runtimeEnv: typeof window === "undefined" ? process.env : import.meta.env,

  emptyStringAsUndefined: true,
});

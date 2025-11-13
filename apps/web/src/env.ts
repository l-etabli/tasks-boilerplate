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
    FILE_GATEWAY: z.enum(["inMemory", "s3"]).default("inMemory"),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_BUCKET: z.string().optional(),
    S3_PRIVATE_BUCKET: z.string().optional(),
    S3_PUBLIC_URL: z.url().optional(),
  },

  clientPrefix: "VITE_",

  client: {},

  runtimeEnv: typeof window === "undefined" ? process.env : import.meta.env,

  emptyStringAsUndefined: true,
});

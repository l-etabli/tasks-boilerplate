import * as Sentry from "@sentry/tanstackstart-react";
import { env } from "@/env";

let initialized = false;

// Server-only Sentry initialization
export function initServerSentry() {
  if (initialized || typeof window !== "undefined") return;
  initialized = true;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    environment: env.ENVIRONMENT,
  });
}

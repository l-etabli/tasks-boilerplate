import * as Sentry from "@sentry/tanstackstart-react";
import type { AnyRouter } from "@tanstack/react-router";
import { env } from "@/env";

let initialized = false;

export function initSentry(router: AnyRouter) {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: "system",
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: env.VITE_ENVIRONMENT,
  });
}

import * as Sentry from "@sentry/react";
import { type Environment, environments, SENTRY_DSN } from "./sentry.helpers.js";

export function initClientSentry(environment: Environment) {
  console.info("initClientSentry, environment : ", environment);
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment,
  });
}

export type { Environment };
export { Sentry, environments };

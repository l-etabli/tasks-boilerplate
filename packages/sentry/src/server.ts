import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { SENTRY_DSN } from "./sentry.helpers.js";

export function initServerSentry(environment: string) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [nodeProfilingIntegration(), Sentry.postgresIntegration()],
    tracesSampleRate: 1.0,
    environment,
  });
}

export { Sentry };

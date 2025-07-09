import * as Sentry from "@sentry/node";
import { SENTRY_DSN } from "./sentry.helpers.js";

export function initServerSentry(environment: string) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment,
  });
}

export { Sentry };

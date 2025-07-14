import * as Sentry from "@sentry/node";
import { type Environment, SENTRY_DSN, environments } from "./sentry.helpers.js";

export function initServerSentry(environment: string) {
  console.info("initServerSentry, environment : ", environment);
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment,
  });
}

export type { Environment };
export { Sentry, environments };

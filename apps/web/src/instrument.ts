import * as Sentry from "@sentry/react";
import { env } from "./env";

const SENTRY_DSN =
  "https://06e079774be7bb9bbf11077eb388db24@o4509463482990592.ingest.de.sentry.io/4509463484432464";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.browserProfilingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: env.VITE_ENVIRONMENT,
});

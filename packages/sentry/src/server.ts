import * as Sentry from "@sentry/node";
import { SentryPropagator, SentrySampler, SentrySpanProcessor } from "@sentry/opentelemetry";
import { initializeOpenTelemetry } from "@tasks/otel";
import { type Environment, SENTRY_DSN, environments } from "./sentry.helpers.js";

export function initServerSentryWithOTEL(environment: string): any {
  console.info("initServerSentryWithOTEL, environment : ", environment);

  // Initialize Sentry with OpenTelemetry support
  const sentryClient = Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment,
    skipOpenTelemetrySetup: true, // We'll handle OpenTelemetry setup ourselves
  });

  if (!sentryClient) {
    console.warn("Sentry client not initialized, falling back to standard OpenTelemetry setup");
    return initializeOpenTelemetry();
  }

  // Configure OpenTelemetry with Sentry integration
  const sdk = initializeOpenTelemetry({
    spanProcessors: [
      new SentrySpanProcessor() as any, // Type assertion to handle compatibility
    ],
    sampler: new SentrySampler(sentryClient),
    textMapPropagator: new SentryPropagator(),
    contextManager: new Sentry.SentryContextManager(),
  });

  // Validate the setup
  try {
    Sentry.validateOpenTelemetrySetup();
  } catch (error) {
    console.warn("Sentry OpenTelemetry validation failed:", error);
  }

  console.info("Sentry with OpenTelemetry initialized successfully");

  return sdk;
}

export type { Environment };
export { Sentry, environments };

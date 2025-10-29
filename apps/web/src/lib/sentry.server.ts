import * as Sentry from "@sentry/tanstackstart-react";
import { env } from "@/env";

let initialized = false;

export function initServerSentry() {
  if (initialized) return;
  initialized = true;

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    environment: env.ENVIRONMENT,
  });
}

// Helper to wrap server functions with custom span names
export function withServerSpan<T extends (...args: any[]) => Promise<any>>(name: string, fn: T): T {
  return (async (...args: Parameters<T>) => {
    return await Sentry.startSpan(
      {
        name,
        op: "function.server",
      },
      () => fn(...args),
    );
  }) as T;
}

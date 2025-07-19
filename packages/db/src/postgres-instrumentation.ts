import type { Pool, PoolClient } from "pg";

export interface SentryInterface {
  startSpan: <T>(
    options: { op: string; name: string; data?: Record<string, unknown> },
    callback: () => T,
  ) => T;
  getCurrentSpan?: () => any;
}

// Instrument the PostgreSQL pool to capture query details
export const createSentryInstrumentedPool = (pool: Pool, sentry: SentryInterface): Pool => {
  // Create a proxy around the pool to intercept operations
  return new Proxy(pool, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === "connect" && typeof value === "function") {
        return async (...args: unknown[]) => {
          const client = await value.apply(target, args);
          return instrumentClient(client, sentry);
        };
      }

      if (prop === "query" && typeof value === "function") {
        return async (...args: unknown[]) => {
          const [queryText, queryParams] = args;

          return sentry.startSpan(
            {
              op: "db",
              name: queryText as string,
              data: {
                "db.system": "postgresql",
                "db.statement": queryText,
                "db.parameters": queryParams,
                "db.parameter_count": Array.isArray(queryParams) ? queryParams.length : 0,
              },
            },
            async () => {
              return value.apply(target, args);
            },
          );
        };
      }

      return value;
    },
  });
};

// Instrument individual PostgreSQL clients
const instrumentClient = (client: PoolClient, sentry: SentryInterface): PoolClient => {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === "query" && typeof value === "function") {
        return async (...args: unknown[]) => {
          const [queryText, queryParams] = args;

          return sentry.startSpan(
            {
              op: "db",
              name: queryText as string,
              data: {
                "db.system": "postgresql",
                "db.statement": queryText,
                "db.parameters": queryParams,
                "db.parameter_count": Array.isArray(queryParams) ? queryParams.length : 0,
              },
            },
            async () => {
              return value.apply(target, args);
            },
          );
        };
      }

      return value;
    },
  });
};

// Note: PostgresDialect instrumentation removed due to private member access issues
// The pool and client instrumentation should be sufficient for capturing driver-level details

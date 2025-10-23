import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import type { Instrumentation } from "@opentelemetry/instrumentation";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";

export const getServerInstrumentations = (): Instrumentation[] => {
  return [
    ...getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-dns": {
        enabled: false,
      },
    }),
    new PgInstrumentation({
      enhancedDatabaseReporting: true,
      requireParentSpan: false,
    }),
  ];
};

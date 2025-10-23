import { detectEnvironment, type Environment } from "./environment.js";

export type ExporterType = "console" | "otlp" | "sentry";

export type TelemetryConfig = {
  serviceName: string;
  environment: Environment;
  exporterType: ExporterType;
  otlpEndpoint?: string;
  otlpHeaders?: Record<string, string>;
  sentryDsn?: string;
};

export const buildConfigFromEnv = (overrides: Partial<TelemetryConfig> = {}): TelemetryConfig => {
  // Support both Node.js (process.env) and Vite (import.meta.env) environments
  const getEnv = (key: string, viteKey?: string): string | undefined => {
    // Node.js environment
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
    // Vite/browser environment
    if (typeof import.meta !== "undefined") {
      const importMeta = import.meta as { env?: Record<string, unknown> };
      if (importMeta.env && viteKey) {
        return importMeta.env[viteKey] as string | undefined;
      }
    }
    return undefined;
  };

  const serviceName =
    overrides.serviceName ||
    getEnv("OTEL_SERVICE_NAME", "VITE_OTEL_SERVICE_NAME") ||
    "unknown-service";

  const environment = overrides.environment || detectEnvironment();

  const exporterType = (overrides.exporterType ||
    getEnv("OTEL_EXPORTER_TYPE", "VITE_OTEL_EXPORTER_TYPE") ||
    "console") as ExporterType;

  const otlpEndpoint =
    overrides.otlpEndpoint ||
    getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "VITE_OTEL_EXPORTER_OTLP_ENDPOINT");

  const otlpHeadersString = getEnv("OTEL_EXPORTER_OTLP_HEADERS", "VITE_OTEL_EXPORTER_OTLP_HEADERS");
  const otlpHeaders = otlpHeadersString
    ? Object.fromEntries(
        otlpHeadersString.split(",").map((header) => {
          const [key, value] = header.split("=");
          return [key?.trim(), value?.trim()];
        }),
      )
    : undefined;

  const sentryDsn = overrides.sentryDsn || getEnv("SENTRY_DSN", "VITE_SENTRY_DSN");

  return {
    serviceName,
    environment,
    exporterType,
    otlpEndpoint,
    otlpHeaders,
    sentryDsn,
  };
};

export { detectEnvironment, type Environment, isDevelopment, isProduction } from "./environment.js";
export { createSampler } from "./sampling.js";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import type { TelemetryConfig } from "../config/index.js";

export const createServerExporter = (config: TelemetryConfig): SpanExporter => {
  switch (config.exporterType) {
    case "console":
      return new ConsoleSpanExporter();

    case "otlp":
      if (!config.otlpEndpoint) {
        console.warn(
          "OTLP exporter selected but OTEL_EXPORTER_OTLP_ENDPOINT not set. Falling back to console exporter.",
        );
        return new ConsoleSpanExporter();
      }

      return new OTLPTraceExporter({
        url: config.otlpEndpoint,
        headers: config.otlpHeaders,
      });

    case "sentry":
      console.warn("Sentry exporter not yet implemented. Falling back to console exporter.");
      return new ConsoleSpanExporter();

    default:
      console.warn(
        `Unknown exporter type: ${config.exporterType}. Falling back to console exporter.`,
      );
      return new ConsoleSpanExporter();
  }
};

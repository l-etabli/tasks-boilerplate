import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";

export const environments = ["local", "dev", "staging", "production"] as const;
export type Environment = (typeof environments)[number];

let sdk: NodeSDK | null = null;

export function initOpenTelemetry(environment: Environment = "local") {
  console.info("initOpenTelemetry, environment:", environment);

  // Get Langfuse configuration from environment
  const langfuseEndpoint =
    process.env.LANGFUSE_OTEL_ENDPOINT || "https://cloud.langfuse.com/api/public/otel";
  const langfusePublicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const langfuseSecretKey = process.env.LANGFUSE_SECRET_KEY;

  if (!langfusePublicKey || !langfuseSecretKey) {
    console.warn(
      "LANGFUSE_PUBLIC_KEY or LANGFUSE_SECRET_KEY not found. OpenTelemetry will use console exporter.",
    );
  }

  // Create Basic Auth header for Langfuse
  const authString =
    langfusePublicKey && langfuseSecretKey
      ? Buffer.from(`${langfusePublicKey}:${langfuseSecretKey}`).toString("base64")
      : null;

  // Configure OTLP exporter for Langfuse
  const traceExporter = new OTLPTraceExporter({
    url: langfuseEndpoint,
    headers: authString
      ? {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        }
      : {},
  });

  // Initialize the SDK
  sdk = new NodeSDK({
    serviceName: `tasks-${environment}`,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Enable specific instrumentations
        "@opentelemetry/instrumentation-http": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-pg": {
          enabled: true,
        },
        // Disable instrumentations that aren't needed
        "@opentelemetry/instrumentation-express": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();
  console.info("OpenTelemetry started successfully");
}

export function getTracer(name = "@tasks/otel") {
  return trace.getTracer(name);
}

export function createSpan<T>(
  name: string,
  operation: string,
  fn: () => T | Promise<T>,
  attributes: Record<string, string | number | boolean> = {},
): T | Promise<T> {
  const tracer = getTracer();

  return tracer.startActiveSpan(
    name,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        operation: operation,
        ...attributes,
      },
    },
    (span) => {
      try {
        const result = fn();

        if (result instanceof Promise) {
          return result
            .then((value) => {
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
              return value;
            })
            .catch((error) => {
              span.recordException(error);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message || "Unknown error",
              });
              span.end();
              throw error;
            });
        }

        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message || "Unknown error",
        });
        span.end();
        throw error;
      }
    },
  );
}

export function setUser(userId: string, email?: string) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes({
      "user.id": userId,
      ...(email && { "user.email": email }),
    });
  }
}

export function recordException(error: Error) {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

export function shutdown(): Promise<void> {
  if (sdk) {
    return sdk.shutdown();
  }
  return Promise.resolve();
}

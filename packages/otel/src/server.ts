import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";

const serviceName = process.env.OTEL_SERVICE_NAME || "tasks-backend";
const serviceVersion = process.env.OTEL_SERVICE_VERSION || "1.0.0";

export interface OpenTelemetryConfig {
  serviceName?: string;
  serviceVersion?: string;
  spanProcessors?: any[];
  sampler?: any;
  textMapPropagator?: any;
  contextManager?: any;
}
export function initializeOpenTelemetry(config?: OpenTelemetryConfig) {
  const sdk = new NodeSDK({
    resource: new Resource({
      "service.name": config?.serviceName || serviceName,
      "service.version": config?.serviceVersion || serviceVersion,
    }),
    spanProcessors: config?.spanProcessors || [],
    sampler: config?.sampler,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Enable specific instrumentations
        "@opentelemetry/instrumentation-http": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-pg": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-undici": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // Disable filesystem instrumentation for performance
        },
        "@opentelemetry/instrumentation-dns": {
          enabled: false, // Disable DNS instrumentation for performance
        },
      }),
    ],
  });

  // Note: Propagation and context management should be configured before SDK creation
  // This is handled by the Sentry package when needed

  sdk.start();

  console.info("OpenTelemetry initialized successfully");

  return sdk;
}

export function shutdownOpenTelemetry(sdk: NodeSDK) {
  sdk
    .shutdown()
    .then(() => console.log("OpenTelemetry terminated"))
    .catch((error) => console.log("Error terminating OpenTelemetry", error));
}

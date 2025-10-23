import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { buildConfigFromEnv, type TelemetryConfig } from "../config/index.js";
import { createSampler } from "../config/sampling.js";
import { createServerExporter } from "./exporters.js";
import { getServerInstrumentations } from "./instrumentation.js";
import { createServerResource } from "./resources.js";

let sdk: NodeSDK | null = null;

export const initServerTelemetry = (configOverrides: Partial<TelemetryConfig> = {}): void => {
  if (sdk) {
    console.warn("Server telemetry already initialized. Skipping...");
    return;
  }

  const config = buildConfigFromEnv(configOverrides);
  console.info("[OTEL] Initializing with config:", {
    serviceName: config.serviceName,
    environment: config.environment,
    exporterType: config.exporterType,
    otlpEndpoint: config.otlpEndpoint,
  });

  const resource = createServerResource(config);
  const exporter = createServerExporter(config);
  const sampler = createSampler();
  const instrumentations = getServerInstrumentations();

  sdk = new NodeSDK({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
    sampler,
    instrumentations,
  });

  sdk.start();

  console.info(
    `[OTEL] Server instrumentation initialized (${config.exporterType} -> ${config.otlpEndpoint || "console"})`,
  );

  process.on("SIGTERM", () => {
    sdk
      ?.shutdown()
      .then(() => console.info("[OTEL] SDK shut down successfully"))
      .catch((error) => console.error("[OTEL] Error shutting down SDK", error));
  });
};

export const shutdownServerTelemetry = async (): Promise<void> => {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = null;
};

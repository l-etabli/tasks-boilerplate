import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { buildConfigFromEnv, type TelemetryConfig } from "../config/index.js";
import { createSampler } from "../config/sampling.js";
import { createClientExporter } from "./exporters.js";
import { getClientInstrumentations } from "./instrumentation.js";
import { createClientResource } from "./resources.js";

let provider: WebTracerProvider | null = null;

export const initClientTelemetry = (configOverrides: Partial<TelemetryConfig> = {}): void => {
  if (provider) {
    console.warn("Client telemetry already initialized. Skipping...");
    return;
  }

  const config = buildConfigFromEnv(configOverrides);
  const resource = createClientResource(config);
  const exporter = createClientExporter(config);
  const sampler = createSampler();

  provider = new WebTracerProvider({
    resource,
    sampler,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  const instrumentations = getClientInstrumentations();
  registerInstrumentations({
    instrumentations,
    tracerProvider: provider,
  });

  console.info(`OpenTelemetry client instrumentation initialized (${config.exporterType})`);
};

export const shutdownClientTelemetry = async (): Promise<void> => {
  if (!provider) {
    return;
  }

  await provider.shutdown();
  provider = null;
};

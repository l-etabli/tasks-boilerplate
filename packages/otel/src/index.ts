export { initClientTelemetry, shutdownClientTelemetry } from "./client/index.js";
export type { Environment, ExporterType, TelemetryConfig } from "./config/index.js";
export {
  buildConfigFromEnv,
  createSampler,
  detectEnvironment,
  isDevelopment,
  isProduction,
} from "./config/index.js";
export {
  createFunctionMiddleware,
  createRequestMiddleware,
  createTanStackMiddleware,
} from "./middleware/tanstack-start.js";
export { initServerTelemetry, shutdownServerTelemetry } from "./server/index.js";
export {
  createDatabaseAttributes,
  createFunctionAttributes,
  createHttpAttributes,
} from "./utils/attributes.js";
export { endSpan, getTracer, recordError, startSpan, withSpan } from "./utils/tracing.js";

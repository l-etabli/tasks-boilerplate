// instrumentation.js - MUST be loaded BEFORE app code
// Load via NODE_OPTIONS=--import ./instrumentation.js

console.log("[instrumentation.js] ===== LOADING INSTRUMENTATION FILE =====");

import { initServerTelemetry } from "@tasks/otel/server";

// Initialize OTEL before anything else
initServerTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME || "tasks-web",
});

console.log("[instrumentation.js] OpenTelemetry initialized");

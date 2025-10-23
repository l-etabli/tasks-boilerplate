
console.info("[Nitro Plugin] Loading otel.ts plugin...");

import { initServerTelemetry } from "@tasks/otel/server";

console.info("[Nitro Plugin] Initializing server telemetry...");
initServerTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME || "tasks-web",
});

export default () => {
  console.info("[Nitro Plugin] OTEL plugin hook executed");
};


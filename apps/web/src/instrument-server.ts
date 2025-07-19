import { initOpenTelemetry } from "@tasks/otel/server";
import { env } from "./env";

initOpenTelemetry(env.ENVIRONMENT);

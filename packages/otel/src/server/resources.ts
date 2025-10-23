import { Resource } from "@opentelemetry/resources";
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import type { TelemetryConfig } from "../config/index.js";

export const createServerResource = (config: TelemetryConfig): Resource => {
  const attributes: Record<string, string> = {
    [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment,
  };

  const version = process.env.npm_package_version || "unknown";
  attributes[SEMRESATTRS_SERVICE_VERSION] = version;

  if (process.env.HOSTNAME) {
    attributes["host.name"] = process.env.HOSTNAME;
  }

  if (process.env.CONTAINER_NAME) {
    attributes["container.name"] = process.env.CONTAINER_NAME;
  }

  return new Resource(attributes);
};

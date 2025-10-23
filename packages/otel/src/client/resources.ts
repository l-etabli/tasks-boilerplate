import { Resource } from "@opentelemetry/resources";
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";
import type { TelemetryConfig } from "../config/index.js";

export const createClientResource = (config: TelemetryConfig): Resource => {
  const attributes: Record<string, string> = {
    [SEMRESATTRS_SERVICE_NAME]: `${config.serviceName}-client`,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment,
  };

  if (typeof window !== "undefined") {
    attributes["browser.user_agent"] = window.navigator.userAgent;
    attributes["browser.url"] = window.location.href;
  }

  return new Resource(attributes);
};

import {
  AlwaysOnSampler,
  ParentBasedSampler,
  type Sampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-base";
import { isDevelopment } from "./environment.js";

export const createSampler = (): Sampler => {
  if (isDevelopment()) {
    return new AlwaysOnSampler();
  }

  const samplingRate = Number.parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || "0.1");

  return new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(samplingRate),
  });
};

import type { Instrumentation } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";

export const getClientInstrumentations = (): Instrumentation[] => {
  return [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation({
      eventNames: ["click", "submit"],
    }),
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/,
    }),
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/,
    }),
  ];
};

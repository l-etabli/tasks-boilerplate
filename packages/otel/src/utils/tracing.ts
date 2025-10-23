import {
  type Span,
  type SpanOptions,
  SpanStatusCode,
  type Tracer,
  trace,
} from "@opentelemetry/api";

export const getTracer = (name = "@tasks/otel"): Tracer => {
  return trace.getTracer(name);
};

export const startSpan = (name: string, options?: SpanOptions): Span => {
  const tracer = getTracer();
  return tracer.startSpan(name, options);
};

export const endSpan = (span: Span, error?: Error): void => {
  if (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  }
  span.end();
};

export const recordError = (span: Span, error: Error): void => {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
};

export const withSpan = async <T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: SpanOptions,
): Promise<T> => {
  const span = startSpan(name, options);
  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    recordError(span, error as Error);
    throw error;
  } finally {
    span.end();
  }
};

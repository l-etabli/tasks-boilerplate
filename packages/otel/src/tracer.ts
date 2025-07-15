import { SpanKind, SpanStatusCode, context, trace } from "@opentelemetry/api";

export function getTracer(name: string) {
  return trace.getTracer(name, "1.0.0");
}

export function createSpan(
  tracerName: string,
  spanName: string,
  spanKind: SpanKind = SpanKind.INTERNAL,
) {
  const tracer = getTracer(tracerName);
  return tracer.startSpan(spanName, { kind: spanKind });
}

export function recordError(span: any, error: Error) {
  span.recordException(error);
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  });
}

export function recordSuccess(span: any, message?: string) {
  span.setStatus({
    code: SpanStatusCode.OK,
    message: message || "Operation completed successfully",
  });
}

export async function instrumentAsync<T>(
  tracerName: string,
  spanName: string,
  operation: () => Promise<T>,
  spanKind: SpanKind = SpanKind.INTERNAL,
): Promise<T> {
  const span = createSpan(tracerName, spanName, spanKind);

  // Set the span as active in the context so child operations are properly nested
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await operation();
      recordSuccess(span);
      return result;
    } catch (error) {
      recordError(span, error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

export function instrumentSync<T>(
  tracerName: string,
  spanName: string,
  operation: () => T,
  spanKind: SpanKind = SpanKind.INTERNAL,
): T {
  const span = createSpan(tracerName, spanName, spanKind);

  // Set the span as active in the context so child operations are properly nested
  return context.with(trace.setSpan(context.active(), span), () => {
    try {
      const result = operation();
      recordSuccess(span);
      return result;
    } catch (error) {
      recordError(span, error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

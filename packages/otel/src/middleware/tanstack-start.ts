import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import { createHttpAttributes } from "../utils/attributes.js";

const tracer = trace.getTracer("@tasks/otel/middleware");

export const createRequestMiddleware = () => {
  return async ({ request, next }: { request: Request; next: () => Promise<Response> }) => {
    const url = new URL(request.url);
    const span = tracer.startSpan(`HTTP ${request.method} ${url.pathname}`, {
      attributes: createHttpAttributes(request.method, url.href, url.pathname),
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const response = await next();

        span.setAttribute("http.response.status_code", response.status);

        if (response.status >= 400) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `HTTP ${response.status}`,
          });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        span.end();
        return response;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message,
        });
        span.end();
        throw error;
      }
    });
  };
};

export const createFunctionMiddleware = () => {
  return async ({
    functionName,
    args,
    next,
  }: {
    functionName: string;
    args: unknown[];
    next: () => Promise<unknown>;
  }) => {
    const span = tracer.startSpan(`function:${functionName}`, {
      attributes: {
        "function.name": functionName,
        "function.args_count": args.length,
      },
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const startTime = Date.now();
        const result = await next();
        const executionTime = Date.now() - startTime;

        span.setAttribute("function.execution_time_ms", executionTime);
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();

        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message,
        });
        span.end();
        throw error;
      }
    });
  };
};

export const createTanStackMiddleware = () => {
  return {
    requestMiddleware: createRequestMiddleware(),
    functionMiddleware: createFunctionMiddleware(),
  };
};

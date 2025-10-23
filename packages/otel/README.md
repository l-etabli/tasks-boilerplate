# @tasks/otel

OpenTelemetry instrumentation package for vendor-neutral observability.

## Overview

`@tasks/otel` provides production-ready OpenTelemetry instrumentation for TanStack Start applications with:

- **Server-side auto-instrumentation**: HTTP requests, PostgreSQL queries, DNS lookups
- **Client-side instrumentation**: Document load, user interactions, fetch/XHR requests, Web Vitals
- **Vendor-neutral**: Send telemetry to any OTLP-compatible backend (Sentry, Grafana, SigNoz)
- **Zero vendor lock-in**: Switch backends without changing application code
- **Environment-aware**: Automatic sampling configuration (100% dev, 10% prod)

## Installation

Already installed as a workspace package. Add to your app:

```json
{
  "dependencies": {
    "@tasks/otel": "workspace:*"
  }
}
```

## Quick Start

### Server Initialization

For TanStack Start with Nitro, create a Nitro plugin:

```typescript
// apps/web/server/plugins/otel.ts
import { initServerTelemetry } from "@tasks/otel/server";

initServerTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME || "tasks-web",
});

export default () => {
  // OpenTelemetry initialized at module load time (above)
};
```

Nitro automatically loads plugins from `server/plugins/` on server startup, ensuring OpenTelemetry is initialized before any requests are processed.

### Client Initialization

Initialize client telemetry in your root component:

```typescript
// apps/web/src/routes/__root.tsx
import { useEffect } from "react";
import { initClientTelemetry } from "@tasks/otel/client";

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      initClientTelemetry({
        serviceName: "tasks-web",
      });
    }
  }, []);

  return <html>{/* ... */}</html>;
}
```

### Environment Configuration

Add to `.env`:

```env
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=tasks-web
NODE_ENV=development
OTEL_EXPORTER_TYPE=console  # console | otlp | sentry
OTEL_TRACES_SAMPLER_ARG=1.0  # 1.0 = 100% sampling in dev
```

For production with OTLP backend:

```env
OTEL_SERVICE_NAME=tasks-web
NODE_ENV=production
OTEL_EXPORTER_TYPE=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-backend.com/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=your-api-key
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% sampling in prod
```

## Features

### Auto-Instrumentation

**Server-side** (automatic):
- HTTP/HTTPS requests
- PostgreSQL queries (via pg instrumentation)
- DNS lookups
- File system operations

**Client-side** (automatic):
- Document load timing
- User interactions (clicks, form submissions)
- Fetch/XHR requests
- Web Vitals (LCP, FID, CLS)

### Manual Tracing

Create custom spans for business logic:

```typescript
import { withSpan } from "@tasks/otel";

export const processTask = async (taskId: string) => {
  return withSpan("useCase.processTask", async (span) => {
    span.setAttribute("task.id", taskId);

    // Your business logic
    const result = await doWork(taskId);

    return result;
  });
};
```

Or use lower-level API:

```typescript
import { startSpan, endSpan, recordError } from "@tasks/otel";

const span = startSpan("custom.operation");
try {
  await doWork();
  endSpan(span);
} catch (error) {
  recordError(span, error as Error);
  endSpan(span);
  throw error;
}
```

### Helper Functions

Create semantic attributes:

```typescript
import { createHttpAttributes, createFunctionAttributes } from "@tasks/otel";

const httpAttrs = createHttpAttributes("GET", url, "/api/tasks", 200);
const funcAttrs = createFunctionAttributes("listTasks", 125);
```

## Exporters

### Console Exporter (Development)

```env
OTEL_EXPORTER_TYPE=console
```

Outputs spans to console for debugging.

### OTLP Exporter (Production)

```env
OTEL_EXPORTER_TYPE=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-backend.com/v1/traces
```

Sends spans to any OTLP-compatible backend:
- Sentry
- Grafana Tempo
- SigNoz
- Jaeger
- Zipkin

### Multiple Backends

Send data to multiple backends simultaneously by:
1. Using OTLP collector as intermediary
2. Configuring collector to fan out to multiple backends

## Architecture

```
Application Code (apps/web)
  ↓
@tasks/otel Package
  ├─ Auto-instrumentation (HTTP, DB, etc.)
  ├─ SDK Processing (sampling, batching)
  └─ Exporters (console, OTLP)
  ↓
Observability Backends
  ├─ Sentry (errors, session replay)
  ├─ Grafana/Tempo (traces)
  └─ Prometheus (metrics - future)
```

## Package Structure

```
packages/otel/
├── src/
│   ├── index.ts              # Main exports
│   ├── server/               # Server-side SDK
│   │   ├── index.ts          # initServerTelemetry()
│   │   ├── instrumentation.ts # Auto-instrumentation
│   │   ├── resources.ts      # Resource attributes
│   │   └── exporters.ts      # Server exporters
│   ├── client/               # Client-side SDK
│   │   ├── index.ts          # initClientTelemetry()
│   │   ├── instrumentation.ts # Web instrumentation
│   │   └── exporters.ts      # Browser exporters
│   ├── config/               # Configuration utilities
│   │   ├── environment.ts    # Environment detection
│   │   ├── sampling.ts       # Sampling strategies
│   │   └── index.ts          # Config builder
│   ├── utils/                # Manual tracing helpers
│   │   ├── tracing.ts        # Span creation
│   │   └── attributes.ts     # Semantic conventions
│   └── middleware/           # TanStack Start middleware
│       └── tanstack-start.ts # Request/function tracing
```

## Best Practices

### 1. Semantic Conventions

Use OpenTelemetry semantic conventions for consistency:

```typescript
import { SEMATTRS_HTTP_METHOD } from "@opentelemetry/semantic-conventions";

span.setAttribute(SEMATTRS_HTTP_METHOD, "GET");
```

### 2. Sampling Strategies

- **Development**: 100% sampling for debugging
- **Production**: 10% sampling to reduce costs
- **Critical paths**: Always sample important routes

### 3. Span Naming

Use consistent, hierarchical naming:

```typescript
// ✅ GOOD
"HTTP GET /api/tasks"
"db.query.select.tasks"
"useCase.listMyTasks"

// ❌ BAD
"getTasks"
"query"
"function"
```

### 4. Security

**DO NOT** store:
- Passwords or tokens
- PII without consent
- Full SQL queries

### 5. Error Recording

Always record errors in spans:

```typescript
try {
  await doWork();
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
}
```

## Migration from Sentry SDK

If migrating from pure Sentry SDK:

1. Keep `@tasks/sentry` for error tracking and session replay
2. Add `@tasks/otel` for vendor-neutral instrumentation
3. Send OTEL data to Sentry via OTLP
4. Optionally add Grafana/Prometheus for metrics

This approach gives you:
- Sentry's excellent error tracking UI
- Vendor-neutral instrumentation
- Flexibility to add/switch backends

## Troubleshooting

### No spans visible

Check:
1. `OTEL_EXPORTER_TYPE` is set correctly
2. Server initialization happens before other imports
3. Client initialization runs in browser (check `typeof window`)

### Build warnings about Node.js modules

Normal for bundlers. AWS resource detectors pull in Node.js modules but don't break the build.

### Performance impact

Instrumentation overhead in production:
- ~1-5% latency increase
- ~2-5 MB bundle size increase
- Mitigated by sampling (10% default)

## Resources

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [TanStack Start Observability](https://tanstack.com/start/latest/docs/framework/react/guide/observability)
- [Implementation Guide](../../OBSERVABILITY-IMPLEMENTATION-GUIDE.md)
- [Sentry OTLP](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/)

## License

Same as project root.

# Observability Implementation Guide for apps/web

**Purpose:** Implement production-ready OpenTelemetry instrumentation with vendor-neutral tracing and metrics, avoiding vendor lock-in while maintaining excellent observability.

**Target:** This guide is for implementing OpenTelemetry in `apps/web` (TanStack Start app) as a reusable `packages/otel` package.

## 🎯 Quick Status

**🚧 PLANNING PHASE** - Implementation not started

| Status | Item |
|--------|------|
| ⬜ | packages/otel package created |
| ⬜ | OpenTelemetry dependencies installed |
| ⬜ | Server SDK configured (Node.js) |
| ⬜ | Client SDK configured (Browser) |
| ⬜ | Auto-instrumentation setup (HTTP, DB) |
| ⬜ | TanStack Start middleware created |
| ⬜ | Exporter configuration (console, OTLP) |
| ⬜ | Integration in apps/web |
| ⬜ | Environment variables configured |
| ⬜ | Type check passing |
| ⬜ | Build succeeding |
| ⬜ | Traces visible in console/backend |

**See [Implementation Status](#implementation-status) for details.**

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Why OpenTelemetry?](#why-opentelemetry)
3. [Technology Stack](#technology-stack)
4. [Package Structure](#package-structure)
5. [Implementation Tasks](#implementation-tasks)
6. [File Structure](#file-structure)
7. [Configuration Guide](#configuration-guide)
8. [Best Practices](#best-practices)
9. [Comparison Table](#comparison-table)
10. [Success Criteria](#success-criteria)

---

## Architecture Overview

### What is OpenTelemetry?

OpenTelemetry (OTEL) is an open-source observability framework that provides:
- **Traces**: Request flows through distributed systems
- **Metrics**: Numerical measurements (counters, histograms)
- **Logs**: Structured event records (future scope)

### Core Concepts

**Instrumentation** → **SDK** → **Exporters** → **Backends**

1. **Instrumentation**: Captures telemetry data
   - Auto-instrumentation: HTTP, DB queries, frameworks
   - Manual instrumentation: Custom spans, metrics

2. **SDK**: Processes and batches data
   - Node SDK (server-side)
   - Browser SDK (client-side)

3. **Exporters**: Send data to backends
   - Console (development)
   - OTLP (OpenTelemetry Protocol - universal)
   - Sentry (proprietary but OTLP-compatible)

4. **Backends**: Visualize and analyze
   - Sentry (error tracking, session replay)
   - Grafana/Tempo (traces)
   - SigNoz (open-source APM)
   - Any OTLP-compatible platform

### Data Flow

```
┌─────────────────────────────────────────┐
│  Application Code (apps/web)           │
│  ┌─────────────────────────────────┐   │
│  │  TanStack Start Middleware      │   │
│  │  ↓                               │   │
│  │  Server Functions (listTasks)   │   │
│  │  ↓                               │   │
│  │  Use Cases (@tasks/core)        │   │
│  │  ↓                               │   │
│  │  Database (Kysely)              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓ (traces, metrics)
┌─────────────────────────────────────────┐
│  @tasks/otel Package                    │
│  ┌─────────────────────────────────┐   │
│  │  Auto-Instrumentation           │   │
│  │  - HTTP requests/responses      │   │
│  │  - Database queries (Kysely)    │   │
│  │  - React Router navigation      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  SDK Processing                 │   │
│  │  - Sampling (10% in prod)       │   │
│  │  - Batching                     │   │
│  │  - Resource attributes          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓ (exported data)
┌─────────────────────────────────────────┐
│  Exporters (configurable)               │
│  ├─ Console (dev)                       │
│  ├─ OTLP → Sentry (prod)               │
│  └─ OTLP → Other backends (future)     │
└─────────────────────────────────────────┘
```

---

## Why OpenTelemetry?

### The Vendor Lock-in Problem

**Current Sentry Package:**
- ✅ Excellent error tracking UI
- ✅ Session replay
- ❌ Proprietary SDK and data format
- ❌ Converts OTLP to proprietary schema
- ❌ Locked into Sentry's query language (SnQL)
- ❌ Cannot switch backends without rewriting instrumentation

**OpenTelemetry Solution:**
- ✅ Instrument once, send anywhere
- ✅ Industry standard (CNCF project)
- ✅ Vendor-neutral
- ✅ Extensive auto-instrumentation
- ✅ Can use multiple backends simultaneously
- ✅ Future-proof

### Research Findings (2025)

From web searches on OpenTelemetry vs Sentry:

> "OpenTelemetry prevents vendor lock-in with its vendor-neutral approach, allowing you to collect data once and direct it to a variety of backends. In contrast, Sentry immediately converts OTel data ingestion into its proprietary schema."

> "Sentry SDK uses OpenTelemetry under the hood, which means that any OpenTelemetry instrumentation that emits spans will automatically be picked up by Sentry."

> "Established vendors like Datadog, New Relic, and Dynatrace have made significant investments in OpenTelemetry compatibility, though legacy giants treat OpenTelemetry as just another input, funneling data into their expensive, proprietary black boxes."

**Key Insight:** We can use OpenTelemetry instrumentation and send data to Sentry initially, then add or switch to other backends later without changing application code.

### Decision Matrix

| Factor | Pure Sentry | OTEL + Sentry | Pure OTEL |
|--------|------------|---------------|-----------|
| Setup Time | 1-2 hours | 3-4 hours | 6-8 hours |
| Vendor Lock-in | ❌ Full | ✅ None | ✅ None |
| Error Tracking UI | ✅ Excellent | ✅ Excellent | ⚠️ Varies |
| Flexibility | ❌ Low | ✅ High | ✅ High |
| Cost at Scale | ❌ Expensive | ⚠️ Moderate | ✅ Low |
| Multi-Backend | ❌ No | ✅ Yes | ✅ Yes |

**Our Choice: OTEL + Sentry Backend**
- Instrument with OpenTelemetry (future-proof)
- Send to Sentry initially (great UI)
- Add Grafana/Prometheus later if needed
- Zero vendor lock-in

---

## Technology Stack

### Core OpenTelemetry Packages

**Server (Node.js):**
```json
{
  "@opentelemetry/sdk-node": "^0.57.0",
  "@opentelemetry/auto-instrumentations-node": "^0.52.0",
  "@opentelemetry/exporter-trace-otlp-http": "^0.57.0",
  "@opentelemetry/exporter-trace-otlp-grpc": "^0.57.0",
  "@opentelemetry/instrumentation-http": "^0.57.0",
  "@opentelemetry/instrumentation-pg": "^0.48.0",
  "@opentelemetry/resources": "^1.29.0",
  "@opentelemetry/semantic-conventions": "^1.29.0"
}
```

**Client (Browser):**
```json
{
  "@opentelemetry/sdk-trace-web": "^1.29.0",
  "@opentelemetry/instrumentation-document-load": "^0.43.0",
  "@opentelemetry/instrumentation-user-interaction": "^0.43.0",
  "@opentelemetry/context-zone": "^1.29.0",
  "web-vitals": "^5.1.0"
}
```

**Exporters:**
```json
{
  "@opentelemetry/exporter-trace-otlp-http": "^0.57.0",
  "@sentry/node": "^10.17.0",
  "@sentry/opentelemetry": "^10.17.0"
}
```

### Auto-Instrumentation Coverage

**Server-Side (Automatic):**
- ✅ HTTP/HTTPS requests
- ✅ PostgreSQL queries (via pg instrumentation)
- ✅ DNS lookups
- ✅ File system operations
- ✅ Express/Fastify (if used)

**Client-Side (Automatic):**
- ✅ Document load timing
- ✅ User interactions (clicks, navigation)
- ✅ Fetch/XHR requests
- ✅ Web Vitals (LCP, FID, CLS)
- ✅ React Router navigation (with custom instrumentation)

**Database (Kysely):**
- ✅ Query execution time
- ✅ Connection pool metrics
- ✅ Error tracking
- ⚠️ Requires pg instrumentation

---

## Package Structure

### Why packages/otel?

**Benefits:**
1. **Reusable**: Share across `apps/web` and `apps/web-old`
2. **Centralized**: One source of truth for observability config
3. **Type-safe**: Export types and utilities
4. **Maintainable**: Update OTEL versions in one place
5. **Testable**: Can test instrumentation independently
6. **Clean Architecture**: Infrastructure separated from business logic

### Proposed Structure

```
packages/otel/
├── package.json              # @tasks/otel
├── tsconfig.json
├── README.md                 # Usage documentation
└── src/
    ├── index.ts              # Main exports (server + client)
    ├── server/
    │   ├── index.ts          # Server SDK initialization
    │   ├── instrumentation.ts # Auto-instrumentation setup
    │   ├── resources.ts      # Resource attributes
    │   └── exporters.ts      # Server exporters
    ├── client/
    │   ├── index.ts          # Browser SDK initialization
    │   ├── instrumentation.ts # Web instrumentation
    │   └── exporters.ts      # Browser exporters
    ├── middleware/
    │   ├── tanstack-start.ts # TanStack Start middleware
    │   └── types.ts          # Middleware types
    ├── config/
    │   ├── index.ts          # Configuration utilities
    │   ├── sampling.ts       # Sampling strategies
    │   └── environment.ts    # Environment detection
    └── utils/
        ├── tracing.ts        # Manual span creation helpers
        └── attributes.ts     # Semantic conventions helpers
```

### Export Strategy

```typescript
// packages/otel/src/index.ts
export { initServerTelemetry } from './server';
export { initClientTelemetry } from './client';
export { createTanStackMiddleware } from './middleware/tanstack-start';
export { getTracer, startSpan, endSpan } from './utils/tracing';
export type { TelemetryConfig, SpanOptions } from './types';
```

**No Build Step** (like `@tasks/core`, `@tasks/trousse`):
- Export directly from `src/index.ts`
- Faster development iteration
- Simpler for monorepo usage

---

## Implementation Tasks

### Phase 1: Package Setup (Priority 1)

**Goal:** Create `packages/otel` package structure

1. **Create Package Directory**
   - [ ] Create `packages/otel/` directory
   - [ ] Create `packages/otel/src/` subdirectories
   - [ ] Copy folder structure from above

2. **Package Configuration**
   - [ ] Create `packages/otel/package.json`
   - [ ] Set name: `@tasks/otel`
   - [ ] Set type: `module`
   - [ ] Set exports: `./server`, `./client`, `./middleware`
   - [ ] Add OpenTelemetry dependencies (server)
   - [ ] Add OpenTelemetry dependencies (client)
   - [ ] Add TypeScript as devDependency

3. **TypeScript Configuration**
   - [ ] Create `packages/otel/tsconfig.json`
   - [ ] Extend from `@tasks/typescript-config`
   - [ ] Configure for library build
   - [ ] Add typecheck script

4. **Documentation**
   - [ ] Create `packages/otel/README.md`
   - [ ] Document initialization API
   - [ ] Add usage examples
   - [ ] Link to this guide

---

### Phase 2: Server Instrumentation (Priority 2)

**Goal:** Implement Node.js telemetry

5. **Resource Attributes**
   - [ ] Create `src/server/resources.ts`
   - [ ] Define service name from environment
   - [ ] Add deployment environment (dev/staging/prod)
   - [ ] Add service version from package.json
   - [ ] Add host/container information

6. **Auto-Instrumentation Setup**
   - [ ] Create `src/server/instrumentation.ts`
   - [ ] Configure HTTP instrumentation
   - [ ] Configure PostgreSQL instrumentation (for Kysely)
   - [ ] Configure DNS instrumentation
   - [ ] Register all instrumentations

7. **Server Exporters**
   - [ ] Create `src/server/exporters.ts`
   - [ ] Implement console exporter (dev only)
   - [ ] Implement OTLP HTTP exporter
   - [ ] Add environment-based selection
   - [ ] Add Sentry exporter (optional)

8. **Server SDK Initialization**
   - [ ] Create `src/server/index.ts`
   - [ ] Export `initServerTelemetry()` function
   - [ ] Initialize NodeSDK with resources
   - [ ] Register instrumentations
   - [ ] Register exporters
   - [ ] Add shutdown hook

---

### Phase 3: Client Instrumentation (Priority 3)

**Goal:** Implement browser telemetry

9. **Client Resource Attributes**
   - [ ] Create `src/client/resources.ts`
   - [ ] Add browser information (user agent)
   - [ ] Add deployment environment
   - [ ] Add page URL context

10. **Web Instrumentation**
    - [ ] Create `src/client/instrumentation.ts`
    - [ ] Configure document load instrumentation
    - [ ] Configure user interaction instrumentation
    - [ ] Configure fetch/XHR instrumentation
    - [ ] Add Web Vitals integration

11. **Client Exporters**
    - [ ] Create `src/client/exporters.ts`
    - [ ] Implement console exporter (dev)
    - [ ] Implement OTLP HTTP exporter (prod)
    - [ ] Handle CORS configuration

12. **Client SDK Initialization**
    - [ ] Create `src/client/index.ts`
    - [ ] Export `initClientTelemetry()` function
    - [ ] Initialize WebTracerProvider
    - [ ] Register instrumentations
    - [ ] Register exporters

---

### Phase 4: TanStack Start Middleware (Priority 4)

**Goal:** Automatic request/function tracing

13. **Request Middleware**
    - [ ] Create `src/middleware/tanstack-start.ts`
    - [ ] Implement request tracer
    - [ ] Capture HTTP method, route, status
    - [ ] Add error capturing
    - [ ] Add timing information

14. **Function Middleware**
    - [ ] Implement server function tracer
    - [ ] Capture function name
    - [ ] Track execution time
    - [ ] Capture input/output metadata
    - [ ] Handle async errors

15. **Middleware Factory**
    - [ ] Export `createTanStackMiddleware()`
    - [ ] Accept configuration options
    - [ ] Return typed middleware tuple
    - [ ] Add documentation comments

---

### Phase 5: Configuration Utilities (Priority 5)

**Goal:** Environment-aware configuration

16. **Environment Detection**
    - [ ] Create `src/config/environment.ts`
    - [ ] Detect NODE_ENV
    - [ ] Map to OTEL environment
    - [ ] Export environment utilities

17. **Sampling Configuration**
    - [ ] Create `src/config/sampling.ts`
    - [ ] Implement dev sampling (100%)
    - [ ] Implement prod sampling (10%)
    - [ ] Add sampling by route (optional)
    - [ ] Export sampling strategies

18. **Configuration Builder**
    - [ ] Create `src/config/index.ts`
    - [ ] Build server config from env
    - [ ] Build client config from env
    - [ ] Validate required variables
    - [ ] Export type-safe config

---

### Phase 6: Manual Tracing Utilities (Priority 6)

**Goal:** Helper functions for custom spans

19. **Tracing Helpers**
    - [ ] Create `src/utils/tracing.ts`
    - [ ] Export `getTracer()` function
    - [ ] Export `startSpan()` wrapper
    - [ ] Export `endSpan()` wrapper
    - [ ] Add error recording helper

20. **Semantic Conventions**
    - [ ] Create `src/utils/attributes.ts`
    - [ ] Export common attribute keys
    - [ ] Add attribute validation
    - [ ] Document semantic conventions

---

### Phase 7: Integration into apps/web (Priority 7)

**Goal:** Wire up telemetry in application

21. **Add Dependency**
    - [ ] Add `@tasks/otel` to `apps/web/package.json`
    - [ ] Run `pnpm install`
    - [ ] Verify package resolves

22. **Server Entry Point**
    - [ ] Find TanStack Start server entry
    - [ ] Import `initServerTelemetry` at top
    - [ ] Initialize BEFORE other imports
    - [ ] Test server starts successfully

23. **Client Entry Point**
    - [ ] Find browser entry point
    - [ ] Import `initClientTelemetry`
    - [ ] Initialize in root component
    - [ ] Test client builds successfully

24. **Middleware Registration**
    - [ ] Import `createTanStackMiddleware`
    - [ ] Register in router configuration
    - [ ] Apply to both request and function middleware
    - [ ] Test middleware executes

25. **Environment Variables**
    - [ ] Add OTEL_SERVICE_NAME to `.env`
    - [ ] Add OTEL_EXPORTER_OTLP_ENDPOINT (if needed)
    - [ ] Add OTEL_EXPORTER_TYPE (console/otlp/sentry)
    - [ ] Add NODE_ENV configuration
    - [ ] Update `.env.example`

---

### Phase 8: Testing & Verification (Priority 8)

**Goal:** Validate instrumentation works

26. **Development Testing**
    - [ ] Start dev server: `pnpm dev`
    - [ ] Check console for trace output
    - [ ] Make HTTP request to server function
    - [ ] Verify spans appear in console
    - [ ] Check span attributes (method, route, status)

27. **Client Testing**
    - [ ] Open browser dev tools
    - [ ] Navigate between routes
    - [ ] Verify navigation spans
    - [ ] Check Web Vitals metrics
    - [ ] Test user interaction spans

28. **Database Testing**
    - [ ] Execute query (listTasks)
    - [ ] Verify DB span in trace
    - [ ] Check query is NOT in attributes (security)
    - [ ] Verify timing information

29. **Error Testing**
    - [ ] Trigger server error
    - [ ] Verify error span recorded
    - [ ] Check exception details
    - [ ] Test error recovery

30. **Build Verification**
    - [ ] Run `pnpm typecheck`
    - [ ] Run `pnpm check:fix`
    - [ ] Run `pnpm build`
    - [ ] Test production build

---

### Phase 9: Backend Integration (Optional)

**Goal:** Send traces to observability backend

31. **Sentry Backend (If Using)**
    - [ ] Get Sentry OTLP endpoint
    - [ ] Configure OTLP exporter URL
    - [ ] Add Sentry DSN if needed
    - [ ] Verify traces appear in Sentry UI
    - [ ] Test session replay integration

32. **Alternative Backends (Optional)**
    - [ ] Configure Grafana Tempo endpoint
    - [ ] Configure SigNoz endpoint
    - [ ] Test multi-backend export
    - [ ] Compare backend capabilities

---

### Phase 10: Advanced Features (Optional)

**Goal:** Production-ready enhancements

33. **Custom Use Case Spans**
    - [ ] Add spans to `@tasks/core` use cases
    - [ ] Track task creation timing
    - [ ] Add business metrics
    - [ ] Document custom span usage

34. **Performance Optimization**
    - [ ] Implement intelligent sampling
    - [ ] Add span compression
    - [ ] Configure batch export
    - [ ] Test performance impact

35. **Monitoring Dashboard**
    - [ ] Set up Grafana dashboard (if self-hosted)
    - [ ] Create trace visualization
    - [ ] Add latency charts
    - [ ] Configure alerting

---

## File Structure

### Final Package Structure

```
packages/otel/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── server/
    │   ├── index.ts              # initServerTelemetry()
    │   ├── instrumentation.ts    # Auto-instrumentation
    │   ├── resources.ts          # Resource attributes
    │   └── exporters.ts          # Console, OTLP, Sentry
    ├── client/
    │   ├── index.ts              # initClientTelemetry()
    │   ├── instrumentation.ts    # Web instrumentation
    │   └── exporters.ts          # Browser exporters
    ├── middleware/
    │   ├── tanstack-start.ts     # Middleware factory
    │   └── types.ts              # Middleware types
    ├── config/
    │   ├── index.ts              # Config builder
    │   ├── sampling.ts           # Sampling strategies
    │   └── environment.ts        # Environment detection
    └── utils/
        ├── tracing.ts            # Manual tracing helpers
        └── attributes.ts         # Semantic conventions
```

### Integration Points in apps/web

```
apps/web/
├── src/
│   ├── entry-server.ts           # Import initServerTelemetry (first!)
│   ├── entry-client.ts           # Import initClientTelemetry
│   ├── router.tsx                # Register middleware
│   └── server/
│       └── functions/
│           └── tasks.ts          # (Optional) Manual spans
├── .env
└── package.json                  # Add @tasks/otel dependency
```

---

## Configuration Guide

### Environment Variables

Create or update `.env`:

```env
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=tasks-web
NODE_ENV=development  # or production

# Exporter Selection (console|otlp|sentry)
OTEL_EXPORTER_TYPE=console  # Use console in dev

# OTLP Exporter (if OTEL_EXPORTER_TYPE=otlp)
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-backend.com/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=your-api-key

# Sentry Exporter (if OTEL_EXPORTER_TYPE=sentry)
SENTRY_DSN=https://your-sentry-dsn

# Sampling
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% in production
```

### Initialization Example

**Server Entry (before other imports):**
```typescript
// apps/web/src/entry-server.ts
import { initServerTelemetry } from '@tasks/otel/server';

// MUST be first - initializes instrumentation
initServerTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME,
  environment: process.env.NODE_ENV,
});

// Now import app code
import { createRouter } from './router';
// ... rest of server setup
```

**Client Entry:**
```typescript
// apps/web/src/entry-client.ts
import { initClientTelemetry } from '@tasks/otel/client';

initClientTelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME,
  environment: process.env.NODE_ENV,
});

// ... rest of client code
```

**Middleware Registration:**
```typescript
// apps/web/src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { createTanStackMiddleware } from '@tasks/otel/middleware';
import { routeTree } from './routeTree.gen';

const { requestMiddleware, functionMiddleware } = createTanStackMiddleware();

export const getRouter = () => {
  return createRouter({
    routeTree,
    requestMiddleware: [requestMiddleware],
    functionMiddleware: [functionMiddleware],
  });
};
```

---

## Best Practices

### 1. Semantic Conventions

Use OpenTelemetry semantic conventions for consistency:

```typescript
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

span.setAttributes({
  [SemanticAttributes.HTTP_METHOD]: 'GET',
  [SemanticAttributes.HTTP_URL]: request.url,
  [SemanticAttributes.HTTP_STATUS_CODE]: response.status,
});
```

### 2. Sampling Strategies

**Development:** 100% sampling for debugging
```typescript
sampler: new AlwaysOnSampler(),
```

**Production:** 10% sampling to reduce costs
```typescript
sampler: new TraceIdRatioBasedSampler(0.1),
```

**Custom:** Sample based on route importance
```typescript
sampler: new ParentBasedSampler({
  root: new CustomSampler({
    '/api/critical': 1.0,  // Always sample
    '/api/health': 0.01,   // Rarely sample
  }),
});
```

### 3. Span Naming

Use consistent, hierarchical naming:
```typescript
// ✅ GOOD
'HTTP GET /api/tasks'
'db.query.select.tasks'
'useCase.listMyTasks'

// ❌ BAD
'getTasks'
'query'
'function'
```

### 4. Attribute Guidelines

**DO:**
- Use semantic conventions when available
- Add business context (userId, tenantId)
- Include resource identifiers (taskId)

**DON'T:**
- Store sensitive data (passwords, tokens)
- Store PII without consent
- Store full SQL queries (security risk)

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

### 6. Resource Attributes

Set once at initialization:
```typescript
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'tasks-web',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production',
});
```

### 7. Context Propagation

OTEL automatically propagates context through:
- HTTP requests (W3C Trace Context headers)
- Async operations (AsyncLocalStorage)
- Database calls (via instrumentation)

**No manual context passing needed!**

---

## Comparison Table

### Observability Solutions Compared

| Feature | Pure Sentry | OTEL + Sentry | OTEL + Grafana | OTEL + SigNoz |
|---------|------------|---------------|----------------|---------------|
| **Setup Time** | 1-2 hours | 3-4 hours | 6-8 hours | 6-8 hours |
| **Vendor Lock-in** | ❌ Full | ✅ None | ✅ None | ✅ None |
| **Cost** | $$$ | $$ | $ (self-host) | $ (self-host) |
| **Error Tracking** | ✅ Excellent | ✅ Excellent | ⚠️ Basic | ✅ Good |
| **Session Replay** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Trace Visualization** | ✅ Good | ✅ Good | ✅ Excellent | ✅ Good |
| **Metrics** | ⚠️ Limited | ⚠️ Limited | ✅ Excellent | ✅ Good |
| **Auto-Instrumentation** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Data Portability** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Multi-Backend** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Infrastructure** | ☁️ Hosted | ☁️ Hosted | 🏠 Self-host | ☁️ / 🏠 Both |

**Legend:**
- ✅ Excellent support
- ⚠️ Limited support
- ❌ Not supported
- $ Cost indicator ($ = low, $$$ = high)

### Migration Path

```
Phase 1: OTEL + Sentry
├─ Instrument with OpenTelemetry
├─ Send to Sentry for error tracking
└─ Keep session replay feature

Phase 2: Add Metrics Backend (Optional)
├─ Keep Sentry for errors
├─ Add Prometheus/Grafana for metrics
└─ Duplicate trace export (OTEL allows this!)

Phase 3: Full Migration (If Needed)
├─ Switch to SigNoz/Grafana for traces
├─ Keep or remove Sentry
└─ Zero code changes required!
```

---

## Success Criteria

### Functional Requirements

- [ ] Traces visible in console during development
- [ ] Server functions automatically traced
- [ ] Database queries automatically traced
- [ ] HTTP requests automatically traced
- [ ] Client-side navigation traced
- [ ] Web Vitals metrics captured
- [ ] Errors recorded in spans
- [ ] Context propagated across async boundaries

### Technical Requirements

- [ ] TypeScript strict mode passes
- [ ] Zero runtime errors
- [ ] Build succeeds: `pnpm build`
- [ ] Type check passes: `pnpm typecheck`
- [ ] Lint passes: `pnpm check:fix`
- [ ] No `as any` assertions
- [ ] All exports typed correctly

### Performance Requirements

- [ ] Server startup time < 2 seconds
- [ ] Client bundle size impact < 50KB
- [ ] Tracing overhead < 5% in production
- [ ] No memory leaks from instrumentation
- [ ] Sampling reduces data volume appropriately

### Documentation Requirements

- [ ] README.md in packages/otel
- [ ] Inline code comments for complex logic
- [ ] Environment variable documentation
- [ ] Usage examples for manual spans
- [ ] Migration guide from Sentry (if applicable)

---

## Implementation Status

**STATUS: 🚧 PLANNING PHASE**

No implementation has started yet. This document serves as the complete specification.

### Next Steps

1. Get approval on package structure
2. Decide on initial exporter (console vs OTLP vs Sentry)
3. Begin Phase 1: Package Setup
4. Iterate through phases sequentially
5. Test at each phase before proceeding

### Open Questions

- [ ] **Exporter Strategy:** Start with console, OTLP, or Sentry?
- [ ] **Sentry Package:** Keep `packages/sentry` or migrate to OTEL fully?
- [ ] **Sampling Rate:** 10% in prod acceptable?
- [ ] **Backend:** Self-host Grafana or use Sentry cloud?
- [ ] **Database Queries:** Log full queries in dev only?

---

## Additional Resources

### OpenTelemetry Documentation
- Official Docs: https://opentelemetry.io/docs/
- JS SDK Docs: https://opentelemetry.io/docs/languages/js/
- Semantic Conventions: https://opentelemetry.io/docs/specs/semconv/

### TanStack Start Integration
- Recent Guide (Jan 2025): https://dev.to/jamie_davenport/opentelemetry-in-tanstack-start-with-better-stack-5d89
- Official Observability Docs: https://tanstack.com/start/latest/docs/framework/react/guide/observability

### Backend Options
- Sentry OTLP: https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/
- Grafana Tempo: https://grafana.com/docs/tempo/latest/
- SigNoz: https://signoz.io/docs/
- Better Stack: https://betterstack.com/

### Best Practices
- OTEL Best Practices: https://betterstack.com/community/guides/observability/opentelemetry-best-practices/
- Sampling Strategies: https://opentelemetry.io/docs/specs/otel/trace/sdk/#sampling
- Semantic Conventions: https://github.com/open-telemetry/semantic-conventions

---

## Notes

- TanStack Start has experimental OTEL support coming natively
- Current implementation will align with future first-class support
- Kysely doesn't have native OTEL instrumentation, use pg instrumentation
- Web Vitals already installed in apps/web (v5.1.0)
- Sentry package can coexist or be deprecated after migration
- OpenTelemetry Collector not needed initially (direct export)

---

**Last Updated:** 2025-01-23
**Author:** Implementation team with AI assistance
**Status:** Planning phase, awaiting approval to begin implementation

# Clean Architecture Monorepo Template

Production-ready TypeScript monorepo template built with **Clean Architecture** principles, featuring TanStack Start, Kysely, better-auth with organizations, and comprehensive testing infrastructure.

## Tech Stack

- **Frontend:** TanStack Start (React 19), TanStack Router, TanStack Form, Tailwind CSS v4, shadcn/ui
- **Backend:** TanStack Start server functions, better-auth (with organizations), typesafe-i18n
- **Database:** PostgreSQL with Kysely (type-safe query builder)
- **Architecture:** Clean Architecture with Ports & Adapters pattern
- **Testing:** Vitest with in-memory adapters
- **Monorepo:** Turbo (v2.6.1) + pnpm (v10.22.0)
- **Code Quality:** Biome (v2.3.5), TypeScript strict mode, lefthook git hooks
- **Deployment:** Docker, Nitro v2, Coolify-ready

## Features

- Clean Architecture with clear separation (domain/ports/adapters)
- Repository pattern with PostgreSQL and in-memory implementations
- Unit of Work pattern for transaction management
- Dependency injection via use case builders
- Multi-organization support with better-auth
- Type-safe i18n (typesafe-i18n)
- Email gateway (Resend or in-memory)
- File storage gateway (S3 or in-memory)
- Comprehensive testing with factories
- Docker Compose for local development
- CI/CD with semantic-release
- Sentry error tracking
- Umami analytics integration

## Quick Start

### Prerequisites

- Node.js ≥ 22.21.1
- pnpm 10.22.0
- Docker (for local PostgreSQL)

### Initial Setup

1. **Clone or use this template**
   ```bash
   # Use as GitHub template or clone
   git clone <your-repo-url>
   cd <your-project>
   ```

2. **Rename project namespace** (IMPORTANT - manual step until init script exists)

   Find and replace `@tasks/` with your own namespace (e.g., `@myapp/`) in:
   - All `package.json` files (8 files in root, apps/*, packages/*)
   - All import statements across the codebase
   - `Dockerfile` (filter `@tasks/web`)
   - This README

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Configure environment**
   ```bash
   cp .env.sample .env
   # Edit .env and configure required variables (see .env.sample for details)
   # Generate BETTER_AUTH_SECRET: openssl rand -base64 32
   ```

5. **Start PostgreSQL**
   ```bash
   docker-compose up postgres -d
   ```

6. **Run database migrations**
   ```bash
   pnpm db:up
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

Visit http://localhost:3000

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages and apps |
| `pnpm build:prod` | Build for production deployment |
| `pnpm check:fix` | Fix linting and formatting issues |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all tests |
| `pnpm fullcheck` | Run all checks (lint, typecheck, test) |
| `pnpm db:up` | Run database migrations (dev) |
| `pnpm db:up:prod` | Run database migrations (production) |
| `pnpm db:create` | Create new database migration |

## Project Structure

```
.
├── apps/
│   └── web/              # TanStack Start application
│       ├── src/
│       │   ├── routes/   # File-based routing
│       │   ├── server/   # Server functions & bootstrapping
│       │   └── i18n/     # Internationalization
│       └── package.json
├── packages/
│   ├── core/             # Clean Architecture core
│   │   ├── domain/       # Entities, ports, use cases
│   │   └── adapters/     # PostgreSQL & in-memory implementations
│   ├── db/               # Kysely database setup & migrations
│   ├── ui/               # Shared shadcn/ui components
│   ├── trousse/          # Use case builder utilities
│   ├── test/             # Shared test utilities
│   └── typescript-config/# Shared TypeScript configs
└── package.json
```

## Architecture

This template follows **Clean Architecture** principles:

- **Domain Layer:** Pure business logic (entities, use cases)
- **Ports:** Interfaces (repositories, queries, gateways)
- **Adapters:** Implementations (PostgreSQL, in-memory, Resend, S3)
- **Dependency Injection:** Explicit via use case builders
- **Testing:** In-memory adapters for fast unit tests

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components` and can be imported:

```tsx
import { Button } from "@tasks/ui/components/button"
```

## Deployment

### Docker

Build and run:
```bash
docker build -t your-app .
docker run -p 3000:3000 --env-file .env your-app
```

### Coolify

CI/CD is configured for Coolify deployment. Update `.github/workflows/ci.yml` with your Coolify instance details or remove if not using.

### Other Platforms

Uses Nitro v2 for flexible deployment. Compatible with Node.js, serverless, and edge runtimes.

## License

MIT

## Contributing

See [CLAUDE.md](./CLAUDE.md) for development guidelines and architecture principles.

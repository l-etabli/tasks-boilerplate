# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Try to avoid type "any" and try to avoid type casting as much as possible.

Run `pnpm fullcheck` when you have done significative changes to make sure me are fine before handing it over to the user.

## Initial Template Setup

**If this is your first time using this template**, please follow the comprehensive setup guide in [SETUP.md](./SETUP.md).

Key steps:
1. Rename the `@tasks/` namespace to your own (e.g., `@myapp/`)
2. Configure environment variables (`.env`)
3. Set up database and run migrations
4. Install dependencies and verify with `pnpm fullcheck`

The rest of this document provides detailed architecture and development guidelines for working with the codebase.

## Key Development Commands

- **Development**: `pnpm dev` - Start development server
- **Build**: `pnpm build` - Build all packages and apps
- **Production Build**: `pnpm build:prod` - Build for production deployment
- **Lint & Format**: `pnpm check:fix` - Fix linting and formatting issues
- **Type Check**: `pnpm typecheck` - Run TypeScript type checking (includes i18n generation)
- **Test**: `pnpm test` - Run all tests
- **Full Check**: `pnpm fullcheck` - Run all checks : typecheck, lint, test
- **Database Migration**: `pnpm db:up` - Run database migrations (dev)
- **Database Migration (Prod)**: `pnpm db:up:prod` - Run database migrations (production)
- **Database Creation**: `pnpm db:create` - Create new database migration

### Package-specific Commands

- **Web App**: `pnpm web <command>` - Run commands in the web app
- **Core Package**: `pnpm core <command>` - Run commands in the core package
- **Database Package**: `pnpm db <command>` - Run commands in the db package

## Architecture Overview

This is a monorepo built with **Clean Architecture** principles using:

- **Turbo** (v2.5.8) for build orchestration with remote caching
- **pnpm** (v10.9.0) for package management
- **Biome** (v2.2.5) for linting and formatting
- **Kysely** (v0.28.7) for type-safe database operations
- **TanStack Start** (v1.132.0) for the web application

### Core Architecture

The codebase follows **Clean Architecture** with clear separation of concerns:

**Core Package (`packages/core/`):**
```
packages/core/src/
├── domain/
│   ├── entities/          # Core business entities
│   │   ├── task.ts        # Task entity
│   │   ├── user-and-organization.ts  # User, Organization entities
│   │   ├── taskFactory.ts        # Test-only factories
│   │   ├── userFactory.ts
│   │   └── organizationFactory.ts
│   ├── ports/             # Interfaces (PascalCase naming)
│   │   ├── TaskRepository.ts
│   │   ├── UserRepository.ts
│   │   ├── TaskQueries.ts
│   │   ├── UserQueries.ts
│   │   ├── EmailGateway.ts
│   │   └── Uow.ts         # Unit of Work pattern
│   └── use-cases/         # Business logic orchestration
│       ├── addTask.ts
│       ├── addTask.test.ts
│       ├── deleteTask.ts
│       ├── deleteTask.test.ts
│       ├── updateUserPreferences.ts
│       ├── updateUserPreferences.test.ts
│       ├── updateOrganization.ts
│       └── deleteOrganization.ts
└── adapters/
    ├── pg/                # PostgreSQL implementations
    │   ├── taskRepository.ts
    │   ├── userRepository.ts
    │   ├── withPgUow.ts   # Transaction management
    │   └── ...
    ├── inMemory/          # In-memory implementations for testing
    │   ├── taskRepository.ts
    │   ├── userRepository.ts
    │   ├── withInMemoryUow.ts
    │   └── ...
    └── email/
        ├── ResendEmailGateway.ts
        └── InMemoryEmailGateway.ts
```

**Database Package (`packages/db/`):**
- Kysely-based PostgreSQL setup
- Migration files in `src/migrations/`
- Type-safe database schema
- Migration commands via kysely-ctl

**Web Application (`apps/web/`):**
- TanStack Start-based React 19 application
- TanStack Router (v1.132.0) for file-based routing
- TanStack Form (v1.23.8) for form management
- better-auth (v1.3.28) for authentication with organizations
- Tailwind CSS v4 (v4.0.6) for styling
- shadcn/ui for UI components
- typesafe-i18n (v5.26.2) for internationalization
- Sentry integration for error tracking
- Vite (v7.1.7) + Nitro v2 for building and deployment

**Shared Packages:**
- `packages/ui/` - Shared shadcn/ui components
- `packages/trousse/` - Use case builder utilities
- `packages/test/` - Shared test utilities (vitest helpers)
- `packages/typescript-config/` - Shared TypeScript configurations

### Key Architectural Principles

1. **Dependency Injection**: Use explicit dependency injection patterns
2. **Repository Pattern**: Keep persistence logic in repositories
3. **Use Cases**: Business logic orchestration without infrastructure dependencies
4. **Unit of Work (UoW)**: Transaction management pattern
5. **Functional Programming**: Prefer pure functions and immutable data structures
6. **Ports & Adapters**: Swappable implementations (PostgreSQL for prod, in-memory for tests)

## Code Examples

### Use Case Pattern

Use cases are built with `@tasks/trousse` and follow a consistent pattern:

```typescript
// packages/core/src/domain/use-cases/addTask.ts
import { useCaseBuilder } from "@tasks/trousse";
import type { AddTaskInput } from "../entities/task.js";
import type { User } from "../entities/user-and-organization.js";
import type { Uow } from "../ports/Uow.js";

const createAuthTransacUseCase = useCaseBuilder()
  .withUow<Uow>()
  .withCurrentUser<User>();

export const addTaskUseCase = createAuthTransacUseCase
  .withInput<AddTaskInput>()
  .build(({ input, currentUser, uow }) => {
    return uow.taskRepository.save({
      ...input,
      owner: currentUser,
    });
  });
```

**Key points:**
- Use case exports have `UseCase` suffix (e.g., `addTaskUseCase`)
- Define reusable builder with common dependencies (`withUow`, `withCurrentUser`)
- Chain input types with `.withInput<T>()`
- Implement logic with explicit dependencies
- Co-locate tests with `.test.ts` extension

### Testing Pattern

Tests use in-memory adapters and follow Arrange-Act-Assert:

```typescript
// packages/core/src/domain/use-cases/deleteTask.test.ts
import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, it } from "vitest";
import { expectPromiseToFailWith } from "../../../../test/src/testUtils.js";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../adapters/inMemory/withInMemoryUow.js";
import { taskFactory } from "../entities/taskFactory.js";
import { userFactory } from "../entities/userFactory.js";
import { deleteTaskUseCase } from "./deleteTask.js";

describe("deleteTask", () => {
  let deleteTask: ReturnType<typeof deleteTaskUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    deleteTask = deleteTaskUseCase({
      withUow: uowConfig.withUow,
    });
  });

  it("should delete an existing task", async () => {
    const task = taskFactory({ owner: currentUser });
    helpers.task.taskById[task.id] = task;

    await deleteTask({ input: { id: task.id }, currentUser });

    expectToEqual(helpers.task.taskById[task.id], undefined);
  });

  it("should throw an error if the task does not belong to the current user", async () => {
    const task = taskFactory({ owner: userFactory() });
    helpers.task.taskById[task.id] = task;

    await expectPromiseToFailWith(
      deleteTask({ input: { id: task.id }, currentUser }),
      "Not your task",
    );
  });
});
```

**Key points:**
- Use factories (`userFactory`, `taskFactory`, `organizationFactory`) for test data
- Use in-memory adapters with direct state access via `helpers`
- Use `expectToEqual` and `expectPromiseToFailWith` from `@tasks/test`
- Follow Arrange-Act-Assert pattern
- Test happy paths AND error cases
- NO framework mocks - use real implementations

### Unit of Work Pattern

The UoW pattern provides transaction management and dependency injection:

```typescript
// packages/core/src/domain/ports/Uow.ts
export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;
```

**PostgreSQL implementation wraps in transaction:**
```typescript
// packages/core/src/adapters/pg/withPgUow.ts
export const createWithPgUnitOfWork = (db: Kysely<Db>): WithUow => {
  return (cb) => {
    return db.transaction().execute((trx) => {
      const uow = {
        taskRepository: createPgTaskRepository(trx),
        userRepository: createPgUserRepository(trx),
      };
      return cb(uow);
    });
  };
};
```

### Dependency Injection & Bootstrap

The core package exports a bootstrap function that wires everything together:

```typescript
// packages/core/src/index.ts
export const bootstrapUseCases = ({
  dbConfig,
  gatewaysConfig,
}: {
  dbConfig: DbAdaptersConfig;
  gatewaysConfig: GatewaysConfig;
}) => {
  const { withUow, queries } = getDbAdapters(dbConfig);
  const gateways = getGateways(gatewaysConfig);

  return {
    queries,
    mutations: {
      addTask: addTaskUseCase({ withUow }),
      deleteTask: deleteTaskUseCase({ withUow }),
      updateUserPreferences: updateUserPreferencesUseCase({ withUow }),
      updateOrganization: updateOrganizationUseCase({ withUow }),
      deleteOrganization: deleteOrganizationUseCase({ withUow }),
    },
    gateways,
  };
};
```

### Server Functions (TanStack Start)

The web app uses TanStack Start server functions for type-safe API layer:

```typescript
// apps/web/src/server/functions/tasks.ts
import { createServerFn } from "@tanstack/react-start";
import { useCases } from "../useCases";
import { authenticated } from "../middleware/authenticated";
import { addTaskSchema } from "@tasks/core";

export const addTask = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "addTask" })])
  .inputValidator(addTaskSchema)
  .handler(async ({ data, context: { currentUser } }) => {
    await useCases.mutations.addTask({
      currentUser,
      input: data,
    });
  });
```

## UI Guidelines

- Use shadcn/ui for all UI components: https://ui.shadcn.com/docs/components
- Use TanStack Form for all form-related components
- Use Zod for schema validation
- When using Zod schemas, do NOT add custom messages - use default messages for translation support with locale configuration
- Follow Tailwind CSS v4 conventions

## Naming Conventions

**Port Files**: Use PascalCase naming that matches the exported type/interface inside the file.
- Example: `TaskRepository.ts` exports `TaskRepository` interface
- Example: `UserQueries.ts` exports `UserQueries` interface
- Example: `Uow.ts` exports `Uow` type
- This ensures consistency and cross-platform compatibility with case-sensitive filesystems

**Use Case Files**: Export with `UseCase` suffix
- Example: `addTask.ts` exports `addTaskUseCase`
- Example: `deleteTask.ts` exports `deleteTaskUseCase`
- In tests, use clean names as local variables: `let addTask: ReturnType<typeof addTaskUseCase>`

**Factory Files**: Test-only factories use lowercase with "Factory" suffix
- Example: `userFactory.ts` exports `userFactory`
- Example: `taskFactory.ts` exports `taskFactory`
- Always document with "Test-only factory" and "DO NOT use in production code"

## Testing Principles

- Use Arrange-Act-Assert pattern for test structure
- Test edge cases and error conditions explicitly
- Prefer real implementations over mocks
- Do NOT use test framework mocks (no vi.fn(), vi.mock(), etc.)
- Write tests that document expected behavior
- Use factory functions for test data generation
- Use in-memory adapters for unit tests
- Access repository state directly via `helpers` for assertions

## Git Hooks & CI/CD

**Git Hooks (via lefthook):**
- **pre-commit**: Runs `pnpm check:fix` on staged files, auto-stages fixes
- **commit-msg**: Validates conventional commit format
- **pre-push**: Runs `pnpm fullcheck` (lint, typecheck, tests)

**CI/CD Pipeline:**
1. On push/PR: Run fullcheck
2. On main branch: Run semantic-release for automated versioning
3. If new version: Build Docker image and push to GitHub Container Registry
4. Deploy to Coolify instance

## Deployment

- Deployed using Docker via `.github/workflows/docker.yml`
- Deployed to Coolify instance
- Uses Nitro v2 for server runtime
- Production builds with `pnpm build:prod`

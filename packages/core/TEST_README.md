# Testing Guide

This package uses Vitest for testing. Tests are organized into two categories:

## Test Types

### Unit Tests (`*.unit.test.ts`)

Unit tests test individual use cases in isolation using mocks. They do not require a database connection.

**Examples:**
- `src/domain/use-cases/addTask.unit.test.ts`
- `src/domain/use-cases/deleteTask.unit.test.ts`

### Integration Tests (`*.integration.test.ts`)

Integration tests test the actual PostgreSQL adapters (repositories and queries). They require a real PostgreSQL database connection.

**Examples:**
- `src/adapters/pg/taskRepository.integration.test.ts`
- `src/adapters/pg/taskQueries.integration.test.ts`

**Requirements:**
- PostgreSQL database must be running
- `DATABASE_URL` environment variable must be set
- Database migrations must be applied

**Behavior:**
- Integration tests will automatically skip if `DATABASE_URL` is not set
- You'll see the tests marked as "skipped" in the output

## Running Tests

### Run All Tests

To run both unit and integration tests:

```bash
pnpm test
```

**Without DATABASE_URL:**
- Unit tests: ✅ Pass (8 tests)
- Integration tests: ⊘ Skipped (12 tests)

**With DATABASE_URL:**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/tasks_test"
pnpm db:up  # Run migrations
pnpm test
```
- Unit tests: ✅ Pass (8 tests)
- Integration tests: ✅ Pass (12 tests)

### Watch Mode

Run tests in watch mode (re-runs on file changes):

```bash
pnpm test:watch
```

### UI Mode

Run tests with an interactive UI:

```bash
pnpm test:ui
```

## Test Structure

### Unit Test Structure

Unit tests use mocks to isolate use cases from their dependencies:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { addTask } from "./addTask.js";
import type { Uow } from "../ports/Uow.js";

describe("addTask use case", () => {
  let mockUow: Uow;
  let mockWithUow: (cb: (uow: Uow) => Promise<void>) => Promise<void>;

  beforeEach(() => {
    mockUow = {
      taskRepository: {
        save: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      // ... other repositories
    };

    mockWithUow = vi.fn(async (cb) => cb(mockUow));
  });

  it("should save a task", async () => {
    const configuredAddTask = addTask({ withUow: mockWithUow });
    await configuredAddTask({ input, currentUser });

    expect(mockUow.taskRepository.save).toHaveBeenCalledWith(/* ... */);
  });
});
```

### Integration Test Structure

Integration tests use actual database connections:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createPgTaskRepository } from "./taskRepository.js";
import { getTestDb, closeTestDb, cleanupTestData } from "../../test-helpers/db-setup.js";

describe("TaskRepository PostgreSQL integration", () => {
  let db: Awaited<ReturnType<typeof getTestDb>>;

  beforeAll(async () => {
    db = getTestDb();
    // Set up test data
  });

  afterAll(async () => {
    // Clean up test data
    await closeTestDb();
  });

  beforeEach(async () => {
    await cleanupTestData(db);
  });

  it("should save a task to the database", async () => {
    const repository = createPgTaskRepository(db);
    await repository.save(task);

    // Verify in database
    const savedTask = await db
      .selectFrom("tasks")
      .selectAll()
      .where("id", "=", task.id)
      .executeTakeFirst();

    expect(savedTask).toBeDefined();
  });
});
```

## Continuous Integration

In CI environments, you should:

1. Set up a test database
2. Run migrations
3. Run all tests

Example GitHub Actions workflow:

```yaml
- name: Set up PostgreSQL
  run: |
    docker run -d -p 5432:5432 \
      -e POSTGRES_PASSWORD=test \
      -e POSTGRES_DB=tasks_test \
      postgres:16

- name: Run migrations
  env:
    DATABASE_URL: postgresql://postgres:test@localhost:5432/tasks_test
  run: pnpm db:up

- name: Run tests
  env:
    DATABASE_URL: postgresql://postgres:test@localhost:5432/tasks_test
  run: pnpm test
```

## Coverage

To generate test coverage reports:

```bash
pnpm test:coverage
```

This will generate coverage reports in the `coverage/` directory.

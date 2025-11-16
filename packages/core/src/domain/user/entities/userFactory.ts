import type { User } from "./user-and-organization.js";

let userIdCounter = 1;

/**
 * Test-only factory for creating User objects with sensible defaults.
 * DO NOT use in production code - only for tests.
 *
 * @example
 * const user = userFactory();
 * const adminUser = userFactory({ id: "admin-1", email: "admin@test.com" });
 */

export const userFactory = (overrides?: Partial<User>): User => {
  const id = overrides?.id ?? `user-${userIdCounter++}`;

  const defaultUser: User = {
    id,
    email: `${id}@example.com`,
    name: `Test User ${id}`,
    preferences: null,
  };

  return { ...defaultUser, ...overrides };
};

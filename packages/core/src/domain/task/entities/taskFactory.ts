import { userFactory } from "../../user/entities/userFactory.js";
import type { Task } from "./task.js";

let taskIdCounter = 1;

/**
 * Test-only factory for creating Task objects with sensible defaults.
 * DO NOT use in production code - only for tests.
 *
 * @example
 * const task = taskFactory();
 * const customTask = taskFactory({ description: "Custom task", owner: someUser });
 */
export const taskFactory = (overrides?: Partial<Task>): Task => {
  const id = overrides?.id ?? `task-${taskIdCounter++}`;

  const defaultTask: Task = {
    id,
    description: `Test task ${id}`,
    owner: userFactory(),
  };

  return { ...defaultTask, ...overrides };
};

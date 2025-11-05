import type { Task } from "../../domain/entities/task.js";
import type { Organization, User } from "../../domain/entities/user-and-organization.js";
import type { WithUow } from "../../domain/ports/Uow.js";
import { createInMemoryTaskRepository } from "./taskRepository.js";
import { createInMemoryUserQueries } from "./userQueries.js";
import { createInMemoryUserRepository } from "./userRepository.js";

export const createWithInMemoryUnitOfWork = (
  taskById: Record<string, Task>,
  userById: Record<string, User>,
  organizationsById: Record<string, Organization>,
): WithUow => {
  const uow = {
    taskRepository: createInMemoryTaskRepository(taskById),
    userRepository: createInMemoryUserRepository(userById, organizationsById),
    userQueries: createInMemoryUserQueries(organizationsById),
  };
  return (cb) => cb(uow);
};

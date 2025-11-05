import type { Task } from "../../domain/entities/task.js";
import type { User } from "../../domain/entities/user-and-organization.js";
import type { WithUow } from "../../domain/ports/Uow.js";
import { createInMemoryTaskRepository } from "./taskRepository.js";
import { createInMemoryUserRepository } from "./userRepository.js";

export const createWithInMemoryUnitOfWork = (): WithUow => {
  const taskById: Record<string, Task> = {};
  const userById: Record<string, User> = {};

  const uow = {
    taskRepository: createInMemoryTaskRepository(taskById),
    userRepository: createInMemoryUserRepository(userById),
  };
  return (cb) => cb(uow);
};

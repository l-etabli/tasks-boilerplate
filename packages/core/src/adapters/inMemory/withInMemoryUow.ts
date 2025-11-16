import type { Uow, WithUow } from "../../domain/shared/ports/Uow.js";
import { createInMemoryTaskRepository, type TaskRepositoryHelpers } from "./taskRepository.js";
import { createInMemoryUserRepository, type UserRepositoryHelpers } from "./userRepository.js";

export type InMemoryHelpers = {
  task: TaskRepositoryHelpers;
  user: UserRepositoryHelpers;
};

export const createWithInMemoryUnitOfWork = (): {
  withUow: WithUow;
  uow: Uow;
  helpers: InMemoryHelpers;
} => {
  const { taskRepository, helpers: taskHelpers } = createInMemoryTaskRepository();
  const { userRepository, helpers: userHelpers } = createInMemoryUserRepository();

  const uow = {
    taskRepository,
    userRepository,
  };
  return { withUow: (cb) => cb(uow), uow, helpers: { task: taskHelpers, user: userHelpers } };
};

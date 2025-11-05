import type { TaskRepository } from "./TaskRepository.js";
import type { UserQueries } from "./UserQueries.js";
import type { UserRepository } from "./UserRepository.js";

export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
  userQueries: UserQueries;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

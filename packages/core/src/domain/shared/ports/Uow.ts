import type { TaskRepository } from "../../task/ports/TaskRepository.js";
import type { UserRepository } from "../../user/ports/UserRepository.js";

export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

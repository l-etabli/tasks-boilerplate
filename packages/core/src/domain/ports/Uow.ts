import type { TaskRepository } from "./TaskRepository.js";
import type { UserRepository } from "./UserRepository.js";

export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

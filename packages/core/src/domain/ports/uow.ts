import type { TaskRepository } from "./taskRepository.js";
import type { UserRepository } from "./userRepository.js";

export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

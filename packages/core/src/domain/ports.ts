import type { Task } from "./entities.js";

export type TaskRepository = {
  save: (task: Task) => Promise<void>;
  getAllForUser: (userId: string) => Promise<Task[]>;
};

export type Uow = {
  taskRepository: TaskRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

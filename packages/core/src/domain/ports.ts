import type { Organization, Task, UpdateUserPreferencesInput, User } from "./entities.js";

export type TaskRepository = {
  save: (task: Task) => Promise<void>;
  getAllForUser: (userId: string) => Promise<Task[]>;
  delete: (taskId: string) => Promise<void>;
};

export type UserRepository = {
  updatePreferences: (userId: string, preferences: UpdateUserPreferencesInput) => Promise<User>;
  getCurrentUserOrganizations: (userId: string) => Promise<Organization[]>;
};

export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

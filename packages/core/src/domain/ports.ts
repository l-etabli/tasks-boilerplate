import type { Organization, Task, UpdateUserPreferencesInput, User } from "./entities.js";

export type TaskQueries = {
  getAllTasksForUser: (userId: string) => Promise<Task[]>;
};

export type UserQueries = {
  getCurrentUserOrganizations: (userId: string) => Promise<Organization[]>;
};

export type TaskRepository = {
  save: (task: Task) => Promise<void>;
  delete: (taskId: string) => Promise<void>;
};

export type UserRepository = {
  updatePreferences: (userId: string, preferences: UpdateUserPreferencesInput) => Promise<User>;
};

export type Uow = {
  taskRepository: TaskRepository;
  userRepository: UserRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => Promise<T>) => Promise<T>;

import type { Task, UpdateUserPreferencesInput, User } from "../domain/entities.js";
import type { TaskRepository, UserRepository, WithUow } from "../domain/ports.js";

// type InMemoryTaskRepository = ReturnType<typeof createInMemoryTaskRepository>;
export const createInMemoryTaskRepository = (taskById: Record<string, Task>) =>
  ({
    save: async (task) => {
      taskById[task.id] = task;
    },
    delete: async (taskId) => {
      delete taskById[taskId];
    },
  }) satisfies TaskRepository;

export const createInMemoryUserRepository = (userById: Record<string, User>) =>
  ({
    updatePreferences: async (
      userId: string,
      preferences: UpdateUserPreferencesInput,
    ): Promise<User> => {
      const existingUser = userById[userId];
      if (!existingUser) {
        throw new Error(`User with id ${userId} not found`);
      }

      const updatedUser = { ...existingUser, ...preferences };
      userById[userId] = updatedUser;
      return updatedUser;
    },
  }) satisfies UserRepository;

export const createWithInMemoryUnitOfWork = (): WithUow => {
  const taskById: Record<string, Task> = {};
  const userById: Record<string, User> = {};

  const uow = {
    taskRepository: createInMemoryTaskRepository(taskById),
    userRepository: createInMemoryUserRepository(userById),
  };
  return (cb) => cb(uow);
};

import type { Task, UpdateUserPreferencesInput, User } from "../domain/entities.js";
import type { TaskRepository, UserRepository, WithUow } from "../domain/ports.js";

// type InMemoryTaskRepository = ReturnType<typeof createInMemoryTaskRepositiory>;
export const createInMemoryTaskRepositiory = () => {
  const taskById: Record<string, Task> = {};

  return {
    getAllForUser: async (userId) =>
      Object.values(taskById).filter((task) => task.owner.id === userId),
    save: async (task) => {
      taskById[task.id] = task;
    },
    delete: async (taskId) => {
      delete taskById[taskId];
    },
  } satisfies TaskRepository;
};

export const createInMemoryUserRepository = () => {
  const userById: Record<string, User> = {};

  return {
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
  } satisfies UserRepository;
};

export const createWithInMemoryUnitOfWork = (): WithUow => {
  const uow = {
    taskRepository: createInMemoryTaskRepositiory(),
    userRepository: createInMemoryUserRepository(),
  };
  return (cb) => cb(uow);
};

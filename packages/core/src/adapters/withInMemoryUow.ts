import type { Organization, Task, UpdateUserPreferencesInput, User } from "../domain/entities.js";
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
  const organizationsById: Record<string, Organization> = {};

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
    getCurrentUserOrganizations: async (userId: string): Promise<Organization[]> => {
      return Object.values(organizationsById).filter((org) =>
        org.members.some((member) => member.userId === userId),
      );
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

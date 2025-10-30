import type {
  UpdateUserPreferencesInput,
  User,
} from "../../domain/entities/user-and-organization.js";
import type { UserRepository } from "../../domain/ports/userRepository.js";

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

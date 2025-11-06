import type {
  Organization,
  UpdateUserPreferencesInput,
  User,
} from "../../domain/entities/user-and-organization.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export const createInMemoryUserRepository = (
  userById: Record<string, User>,
  organizationsById: Record<string, Organization>,
) =>
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

    updateOrganization: async (organizationId, updates) => {
      const existingOrg = organizationsById[organizationId];
      if (!existingOrg) {
        throw new Error(`Organization with id ${organizationId} not found`);
      }

      const updatedOrg = {
        ...existingOrg,
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.logo !== undefined && { logo: updates.logo }),
        ...(updates.metadata !== undefined && { metadata: updates.metadata }),
      };

      organizationsById[organizationId] = updatedOrg;
    },
  }) satisfies UserRepository;

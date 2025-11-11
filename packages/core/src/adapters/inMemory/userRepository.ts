import { clearAndAssign } from "@tasks/test";
import type {
  Organization,
  UpdateUserPreferencesInput,
  User,
} from "../../domain/entities/user-and-organization.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export type UserRepositoryHelpers = {
  userById: Record<string, User>;
  organizationsById: Record<string, Organization>;
  setUsers: (users: User[]) => void;
  setOrganizations: (organizations: Organization[]) => void;
};

export const createInMemoryUserRepository = (): {
  userRepository: UserRepository;
  helpers: UserRepositoryHelpers;
} => {
  const userById: Record<string, User> = {};
  const organizationsById: Record<string, Organization> = {};

  return {
    helpers: {
      userById,
      organizationsById,
      setUsers: (users) => {
        clearAndAssign(userById, users, (user: User) => user.id);
      },
      setOrganizations: (organizations) => {
        clearAndAssign(
          organizationsById,
          organizations,
          (organization: Organization) => organization.id,
        );
      },
    },
    userRepository: {
      getUserOrganizations: async (userId) =>
        Object.values(organizationsById).filter((org) =>
          org.members.some((member) => member.userId === userId),
        ),
      updatePreferences: async (
        userId: string,
        preferences: UpdateUserPreferencesInput,
      ): Promise<User> => {
        const existingUser = userById[userId];
        if (!existingUser) {
          throw new Error(`User with id ${userId} not found`);
        }

        const updatedUser = {
          ...existingUser,
          preferences: { ...existingUser.preferences, ...preferences },
        };
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

      deleteOrganization: async (organizationId) => {
        if (!organizationsById[organizationId]) {
          throw new Error(`Organization with id ${organizationId} not found`);
        }
        delete organizationsById[organizationId];
      },
    },
  };
};

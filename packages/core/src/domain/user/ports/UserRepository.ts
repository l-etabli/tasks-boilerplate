import type {
  Organization,
  UpdateOrganizationInput,
  UpdateUserPreferencesInput,
  User,
} from "../entities/user-and-organization.js";

export type UserRepository = {
  getUserOrganizations: (userId: string) => Promise<Organization[]>;
  updatePreferences: (userId: string, preferences: UpdateUserPreferencesInput) => Promise<User>;
  updateOrganization: (
    organizationId: string,
    updates: Omit<UpdateOrganizationInput, "organizationId">,
  ) => Promise<void>;
  deleteOrganization: (organizationId: string) => Promise<void>;
};

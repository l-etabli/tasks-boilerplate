import type {
  UpdateOrganizationInput,
  UpdateUserPreferencesInput,
  User,
} from "../entities/user-and-organization.js";

export type UserRepository = {
  updatePreferences: (userId: string, preferences: UpdateUserPreferencesInput) => Promise<User>;
  updateOrganization: (
    organizationId: string,
    updates: Omit<UpdateOrganizationInput, "organizationId">,
  ) => Promise<void>;
};

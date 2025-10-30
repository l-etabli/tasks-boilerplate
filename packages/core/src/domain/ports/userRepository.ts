import type { UpdateUserPreferencesInput, User } from "../entities/user-and-organization.js";

export type UserRepository = {
  updatePreferences: (userId: string, preferences: UpdateUserPreferencesInput) => Promise<User>;
};

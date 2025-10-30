import type { Organization } from "../entities/user-and-organization.js";

export type UserQueries = {
  getCurrentUserOrganizations: (userId: string) => Promise<Organization[]>;
};

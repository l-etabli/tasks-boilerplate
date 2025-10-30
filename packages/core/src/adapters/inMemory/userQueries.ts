import type { Organization } from "../../domain/entities/user-and-organization.js";
import type { UserQueries } from "../../domain/ports/userQueries.js";

export const createInMemoryUserQueries = (
  organizationsById: Record<string, Organization>,
): UserQueries => ({
  getCurrentUserOrganizations: async (userId) =>
    Object.values(organizationsById).filter((org) =>
      org.members.some((member) => member.userId === userId),
    ),
});

import { useCaseBuilder } from "@tasks/trousse";
import {
  sanitizeSlug,
  type UpdateOrganizationInput,
  type User,
} from "../entities/user-and-organization.js";
import type { Uow } from "../ports/Uow.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const updateOrganization = createAuthTransacUseCase
  .withInput<UpdateOrganizationInput>()
  .build(async ({ input, currentUser, uow }) => {
    // Get all user's organizations to check their role
    const userOrganizations = await uow.userQueries.getCurrentUserOrganizations(currentUser.id);

    const userOrg = userOrganizations.find((org) => org.id === input.organizationId);

    if (!userOrg) {
      throw new Error("Organization not found");
    }

    // Check if user is an owner
    const currentUserMember = userOrg.members.find((member) => member.userId === currentUser.id);
    if (!currentUserMember || currentUserMember.role !== "owner") {
      throw new Error("Only organization owners can update the organization");
    }

    // Extract the organizationId and pass the rest as updates
    const { organizationId, ...updates } = input;

    // Sanitize slug if provided
    if (updates.slug !== undefined) {
      updates.slug = sanitizeSlug(updates.slug);
    }

    await uow.userRepository.updateOrganization(organizationId, updates);
  });

import { useCaseBuilder } from "@tasks/trousse";
import type { FileGateway } from "../../shared/ports/FileGateway.js";
import type { Uow } from "../../shared/ports/Uow.js";
import { type User, updateOrganizationSchema } from "../entities/user-and-organization.js";

type Deps = {
  fileGateway: FileGateway;
};

const createAuthTransacUseCase = useCaseBuilder()
  .withUow<Uow>()
  .withCurrentUser<User>()
  .withDeps<Deps>();

export const updateOrganizationUseCase = createAuthTransacUseCase
  .withInput(updateOrganizationSchema)
  .build(async ({ input, currentUser, uow, deps }) => {
    // Get all user's organizations to check their role
    const userOrganizations = await uow.userRepository.getUserOrganizations(currentUser.id);

    const userOrg = userOrganizations.find((org) => org.id === input.organizationId);

    if (!userOrg) {
      throw new Error("Organization not found");
    }

    // Check if user is an owner
    const currentUserMember = userOrg.members.find((member) => member.userId === currentUser.id);
    if (!currentUserMember || currentUserMember.role !== "owner") {
      throw new Error("Only organization owners can update the organization");
    }

    // If logo is being updated and there's an old logo, delete it from S3
    if (input.logo !== undefined && userOrg.logo && userOrg.logo !== input.logo) {
      // Extract key from URL (assuming format like test://key or https://domain/key)
      const oldLogoKey = userOrg.logo.includes("://")
        ? userOrg.logo.split("://")[1]?.split("?")[0]
        : userOrg.logo;

      if (oldLogoKey) {
        try {
          await deps.fileGateway.delete(oldLogoKey);
        } catch (error) {
          // Log error but don't fail the update if deletion fails
          console.error("Failed to delete old logo:", error);
        }
      }
    }

    // Extract the organizationId and pass the rest as updates
    const { organizationId, ...updates } = input;

    await uow.userRepository.updateOrganization(organizationId, updates);
  });

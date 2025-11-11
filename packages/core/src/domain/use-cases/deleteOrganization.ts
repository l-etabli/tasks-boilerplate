import { useCaseBuilder } from "@tasks/trousse";
import type { User } from "../entities/user-and-organization.js";
import type { Uow } from "../ports/Uow.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const deleteOrganizationUseCase = createAuthTransacUseCase
  .withInput<{ organizationId: string }>()
  .build(async ({ input, currentUser, uow }) => {
    const userOrganizations = await uow.userRepository.getUserOrganizations(currentUser.id);

    const userOrg = userOrganizations.find((org) => org.id === input.organizationId);

    if (!userOrg) {
      throw new Error("Organization not found");
    }

    const currentUserMember = userOrg.members.find((member) => member.userId === currentUser.id);
    if (!currentUserMember || currentUserMember.role !== "owner") {
      throw new Error("Only organization owners can delete the organization");
    }

    await uow.userRepository.deleteOrganization(input.organizationId);
  });

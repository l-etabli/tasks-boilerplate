import type { Organization } from "../../domain/entities/user-and-organization.js";
import type { UserQueries } from "../../domain/ports/UserQueries.js";

export const createInMemoryUserQueries = (
  organizationsById: Record<string, Organization>,
): UserQueries => ({
  getInvitationById: async (invitationId) => {
    const organization = Object.values(organizationsById).find((org) =>
      org.invitations.some((invitation) => invitation.id === invitationId),
    );

    if (!organization) return;

    const invitation = organization.invitations.find(
      (invitation) => invitation.id === invitationId,
    );

    if (!invitation) return;

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organizationName: organization.name,
      inviterName: invitation.inviterName,
      inviterEmail: invitation.inviterEmail,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  },

  getCurrentUserOrganizations: async (userId) =>
    Object.values(organizationsById).filter((org) =>
      org.members.some((member) => member.userId === userId),
    ),

  getCurrentUserInvitations: async (userEmail) => {
    const now = new Date();
    const invitations = [];

    for (const org of Object.values(organizationsById)) {
      for (const invitation of org.invitations) {
        if (
          invitation.email === userEmail &&
          invitation.status === "pending" &&
          invitation.expiresAt > now
        ) {
          invitations.push({
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            organizationName: org.name,
            inviterName: invitation.inviterName,
            inviterEmail: invitation.inviterEmail,
          });
        }
      }
    }

    return invitations;
  },
});

import type { Organization } from "../entities/user-and-organization.js";

export type InvitationDetails = {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  organizationName: string;
  inviterName: string | null;
  inviterEmail: string;
};

export type UserQueries = {
  getCurrentUserOrganizations: (userId: string) => Promise<Organization[]>;
  getInvitationById: (invitationId: string) => Promise<InvitationDetails | undefined>;
  getCurrentUserInvitations: (userEmail: string) => Promise<InvitationDetails[]>;
};

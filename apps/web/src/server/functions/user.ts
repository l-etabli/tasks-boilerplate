import { createServerFn } from "@tanstack/react-start";
import type { InvitationDetails } from "@tasks/core";
import { updateOrganizationSchema, updateUserPreferencesSchema } from "@tasks/core";
import { z } from "zod";
import { authenticated } from "./auth";
import { useCases } from "./bootstrap";

const getInvitationDetailsSchema = z.object({
  invitationId: z.string(),
});

type GetInvitationDetailsResult =
  | { invitation: InvitationDetails; error: null }
  | { invitation: null; error: "not_found" | "expired" | "server_error" };

export const getInvitationDetails = createServerFn({ method: "GET" })
  .inputValidator(getInvitationDetailsSchema)
  .handler(async (ctx): Promise<GetInvitationDetailsResult> => {
    const { invitationId } = ctx.data;

    try {
      const invitation = await useCases.queries.user.getInvitationById(invitationId);

      if (!invitation) return { invitation: null, error: "not_found" };

      const isExpired = invitation.expiresAt < new Date();
      if (isExpired) return { invitation: null, error: "expired" };

      return {
        invitation,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching invitation:", error);
      return { invitation: null, error: "server_error" };
    }
  });

export const getCurrentUserInvitations = createServerFn({ method: "GET" })
  .middleware([authenticated({ name: "getCurrentUserInvitations" })])
  .handler(async (ctx): Promise<InvitationDetails[]> => {
    const { currentUser } = ctx.context;

    try {
      const invitations = await useCases.queries.user.getCurrentUserInvitations(currentUser.email);
      return invitations;
    } catch (error) {
      console.error("Error fetching user invitations:", error);
      return [];
    }
  });

export const updateUserPreferences = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "updateUserPreferences" })])
  .inputValidator(updateUserPreferencesSchema)
  .handler(async (ctx) => {
    const {
      data,
      context: { currentUser },
    } = ctx;

    const result = await useCases.mutations.updateUserPreferences({
      currentUser,
      input: data,
    });

    return result;
  });

export const updateOrganization = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "updateOrganization" })])
  .inputValidator(updateOrganizationSchema)
  .handler(async (ctx) => {
    const {
      data,
      context: { currentUser },
    } = ctx;

    try {
      const result = await useCases.mutations.updateOrganization({
        currentUser,
        input: data,
      });

      return result;
    } catch (error) {
      console.error("Error updating organization:", error);
      throw error;
    }
  });

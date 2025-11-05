import { createServerFn } from "@tanstack/react-start";
import type { InvitationDetails } from "@tasks/core";
import { updateUserPreferencesSchema } from "@tasks/core";
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

import type { Kysely } from "kysely";
import type { UserQueries } from "../../domain/user/ports/UserQueries.js";
import type { Db } from "./database.js";
import { makeGetUserOrganizations } from "./userSql.js";

export const createPgUserQueries = (db: Kysely<Db>): UserQueries => ({
  getUserPreferences: async (userId) => {
    const user = await db
      .selectFrom("user")
      .where("id", "=", userId)
      .select("preferences")
      .executeTakeFirst();
    return user?.preferences ?? null;
  },

  getInvitationById: async (invitationId) =>
    db
      .selectFrom("invitation")
      .innerJoin("organization", "organization.id", "invitation.organizationId")
      .innerJoin("user as inviter", "inviter.id", "invitation.inviterId")
      .where("invitation.id", "=", invitationId)
      .where("invitation.status", "=", "pending")
      .select([
        "invitation.id",
        "invitation.email",
        "invitation.role",
        "invitation.status",
        "invitation.expiresAt",
        "organization.name as organizationName",
        "inviter.name as inviterName",
        "inviter.email as inviterEmail",
      ])
      .executeTakeFirst(),

  getCurrentUserInvitations: async (userEmail) =>
    db
      .selectFrom("invitation")
      .innerJoin("organization", "organization.id", "invitation.organizationId")
      .innerJoin("user as inviter", "inviter.id", "invitation.inviterId")
      .where("invitation.email", "=", userEmail)
      .where("invitation.status", "=", "pending")
      .where("invitation.expiresAt", ">", new Date())
      .select([
        "invitation.id",
        "invitation.email",
        "invitation.role",
        "invitation.status",
        "invitation.expiresAt",
        "organization.name as organizationName",
        "inviter.name as inviterName",
        "inviter.email as inviterEmail",
      ])
      .execute(),

  getUserOrganizations: makeGetUserOrganizations(db),
});

import { type Kysely, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { UserQueries } from "../../domain/ports/UserQueries.js";
import type { Db } from "./database.js";

export const createPgUserQueries = (db: Kysely<Db>): UserQueries => ({
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

  getCurrentUserOrganizations: async (userId) => {
    const organizations = await db
      .selectFrom("organization")
      .innerJoin("member as currentUserMember", (join) =>
        join
          .onRef("currentUserMember.organizationId", "=", "organization.id")
          .on("currentUserMember.userId", "=", userId),
      )
      .select((eb) => [
        "organization.id",
        "organization.name",
        "organization.slug",
        "organization.logo",
        "organization.metadata",
        "organization.createdAt",
        "currentUserMember.role as role",
        jsonArrayFrom(
          eb
            .selectFrom("member")
            .innerJoin("user", "user.id", "member.userId")
            .whereRef("member.organizationId", "=", "organization.id")
            .orderBy(
              sql`CASE member.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 WHEN 'member' THEN 3 END`,
            )
            .orderBy("user.name", "asc")
            .select([
              "member.id",
              "member.userId",
              "member.role",
              "member.createdAt",
              "user.name as name",
              "user.email as email",
            ]),
        ).as("members"),
        jsonArrayFrom(
          eb
            .selectFrom("invitation")
            .innerJoin("user as inviter", "inviter.id", "invitation.inviterId")
            .whereRef("invitation.organizationId", "=", "organization.id")
            .where("invitation.status", "=", "pending")
            .orderBy("invitation.expiresAt", "desc")
            .select([
              "invitation.id",
              "invitation.email",
              "invitation.role",
              "invitation.status",
              "invitation.expiresAt",
              "inviter.name as inviterName",
              "inviter.email as inviterEmail",
            ]),
        ).as("invitations"),
      ])
      .execute();

    return organizations.map((org) => ({
      ...org,
      members: org.members.map((member) => ({
        ...member,
        createdAt: new Date(member.createdAt),
      })),
      invitations: org.invitations.map((invitation) => ({
        ...invitation,
        expiresAt: new Date(invitation.expiresAt),
      })),
    }));
  },
});

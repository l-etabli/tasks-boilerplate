import type { Kysely } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import type { Db } from "./database.js";

export const createPgUserRepository = (trx: Kysely<Db>) =>
  ({
    updatePreferences: async (userId: string, preferences) => {
      const result = await trx
        .updateTable("user")
        .set({
          preferences: sql`COALESCE(preferences, '{}'::jsonb) || ${JSON.stringify(preferences)}::jsonb`,
        })
        .where("id", "=", userId)
        .returning(["id", "email", "name", "preferences"])
        .executeTakeFirstOrThrow();

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        preferences: result.preferences,
      };
    },

    updateOrganization: async (organizationId, updates) => {
      // Build update object with only provided fields
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.logo !== undefined) updateData.logo = updates.logo;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      // Update the organization
      await trx
        .updateTable("organization")
        .set(updateData)
        .where("id", "=", organizationId)
        .executeTakeFirstOrThrow();

      // Fetch the updated organization with members and invitations
      const org = await trx
        .selectFrom("organization")
        .where("organization.id", "=", organizationId)
        .select((eb) => [
          "organization.id",
          "organization.name",
          "organization.slug",
          "organization.logo",
          "organization.metadata",
          "organization.createdAt",
          jsonArrayFrom(
            eb
              .selectFrom("member")
              .innerJoin("user", "user.id", "member.userId")
              .whereRef("member.organizationId", "=", "organization.id")
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
        .executeTakeFirstOrThrow();

      return {
        ...org,
        members: org.members.map((member) => ({
          ...member,
          createdAt: new Date(member.createdAt),
        })),
        invitations: org.invitations.map((invitation) => ({
          ...invitation,
          expiresAt: new Date(invitation.expiresAt),
        })),
      };
    },
  }) satisfies UserRepository;

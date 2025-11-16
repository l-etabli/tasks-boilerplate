import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { UserRepository } from "../../domain/user/ports/UserRepository.js";
import type { Db } from "./database.js";
import { makeGetUserOrganizations } from "./userSql.js";

export const createPgUserRepository = (trx: Kysely<Db>) =>
  ({
    getUserOrganizations: makeGetUserOrganizations(trx),
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
      if (updates.logo !== undefined) updateData.logo = updates.logo;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      await trx
        .updateTable("organization")
        .set(updateData)
        .where("id", "=", organizationId)
        .executeTakeFirstOrThrow();
    },

    deleteOrganization: async (organizationId) => {
      await trx
        .deleteFrom("organization")
        .where("id", "=", organizationId)
        .executeTakeFirstOrThrow();
    },
  }) satisfies UserRepository;

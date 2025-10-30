import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { UserRepository } from "../../domain/ports/userRepository.js";
import type { Db } from "./database.js";

export const createPgUserRepository = (trx: Kysely<Db>) =>
  ({
    updatePreferences: async (userId: string, preferences) => {
      const result = await trx
        .updateTable("user")
        .set({
          preferences: sql`${JSON.stringify(preferences)}::jsonb`,
        })
        .where("id", "=", userId)
        .returning(["id", "email", "preferences"])
        .executeTakeFirstOrThrow();

      return {
        id: result.id,
        email: result.email,
        preferences: result.preferences,
      };
    },
  }) satisfies UserRepository;

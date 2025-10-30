import type { Kysely } from "kysely";
import type { UserRepository } from "../../domain/ports/userRepository.js";
import type { Db } from "./database.js";

export const createPgUserRepository = (trx: Kysely<Db>) =>
  ({
    updatePreferences: async (userId: string, preferences) => {
      const result = await trx
        .updateTable("user")
        .set(preferences)
        .where("id", "=", userId)
        .returning(["id", "email", "activePlan", "activeSubscriptionId", "preferredLocale"])
        .executeTakeFirstOrThrow();

      return result;
    },
  }) satisfies UserRepository;

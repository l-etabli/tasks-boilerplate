import type { Kysely } from "kysely";
import { jsonBuildObject } from "kysely/helpers/postgres";
import type { TaskQueries } from "../../domain/ports/taskQueries.js";
import type { Db } from "./database.js";

export const createPgTaskQueries = (db: Kysely<Db>): TaskQueries => ({
  getAllTasksForUser: async (userId) =>
    db
      .selectFrom("tasks")
      .innerJoin("user", "user.id", "tasks.ownerId")
      .where("ownerId", "=", userId)
      .select(({ ref }) => [
        "tasks.id as id",
        "description",
        jsonBuildObject({
          id: ref("user.id"),
          email: ref("user.email"),
          preferredLocale: ref("user.preferredLocale"),
        }).as("owner"),
      ])
      .execute(),
});

import type { Kysely } from "kysely";
import { jsonBuildObject } from "kysely/helpers/postgres";
import type { TaskRepository } from "../../domain/ports/TaskRepository.js";
import type { Db } from "./database.js";

export const createPgTaskRepository = (trx: Kysely<Db>) =>
  ({
    getTaskById: async (taskId) =>
      trx
        .selectFrom("tasks")
        .innerJoin("user", "user.id", "tasks.ownerId")
        .where("tasks.id", "=", taskId)
        .select(({ ref }) => [
          "tasks.id as id",
          "description",
          jsonBuildObject({
            id: ref("user.id"),
            email: ref("user.email"),
            name: ref("user.name"),
            preferences: ref("user.preferences"),
          }).as("owner"),
        ])
        .executeTakeFirst(),
    save: async (task) => {
      await trx
        .insertInto("tasks")
        .values({
          id: task.id,
          description: task.description,
          ownerId: task.owner.id,
        })
        .execute();
    },
    delete: async (taskId) => {
      await trx.deleteFrom("tasks").where("id", "=", taskId).execute();
    },
  }) satisfies TaskRepository;

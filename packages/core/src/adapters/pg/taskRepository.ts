import type { Kysely } from "kysely";
import type { TaskRepository } from "../../domain/ports/TaskRepository.js";
import type { Db } from "./database.js";

export const createPgTaskRepository = (trx: Kysely<Db>) =>
  ({
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

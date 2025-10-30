import type { Kysely } from "kysely";
import type { TaskRepository, UserRepository, WithUow } from "../../domain/ports.js";
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

export const createWithPgUnitOfWork = (db: Kysely<Db>): WithUow => {
  return (cb) => {
    return db.transaction().execute((trx) => {
      const uow = {
        taskRepository: createPgTaskRepository(trx),
        userRepository: createPgUserRepository(trx),
      };
      return cb(uow);
    });
  };
};

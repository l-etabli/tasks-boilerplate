import type { Kysely } from "kysely";
import { jsonBuildObject } from "kysely/helpers/postgres";
import type { TaskRepository, WithUow } from "../../domain/ports.js";
import type { Db } from "./database.js";

export const createPgTaskRepositiory = (trx: Kysely<Db>) =>
  ({
    getAllForUser: async (userId) =>
      trx
        .selectFrom("tasks")
        .innerJoin("user", "user.id", "tasks.ownerId")
        .where("ownerId", "=", userId)
        .select(({ ref }) => [
          "tasks.id as id",
          "description",
          jsonBuildObject({
            id: ref("user.id"),
            email: ref("user.email"),
            activePlan: ref("user.activePlan"),
            activeSubscriptionId: ref("user.activeSubscriptionId"),
          }).as("owner"),
        ])
        .execute(),
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
  }) satisfies TaskRepository;

export const createWithPgUnitOfWork = (db: Kysely<Db>): WithUow => {
  return (cb) => {
    return db.transaction().execute((trx) => {
      const uow = { taskRepository: createPgTaskRepositiory(trx) };
      return cb(uow);
    });
  };
};

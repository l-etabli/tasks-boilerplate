import type { Kysely } from "kysely";
import { jsonArrayFrom, jsonBuildObject } from "kysely/helpers/postgres";
import type { TaskRepository, UserRepository, WithUow } from "../../domain/ports.js";
import type { Db } from "./database.js";

export const createPgTaskRepository = (trx: Kysely<Db>) =>
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
            preferredLocale: ref("user.preferredLocale"),
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
    delete: async (taskId) => {
      await trx.deleteFrom("tasks").where("id", "=", taskId).execute();
    },
  }) satisfies TaskRepository;

export const createPgUserRepository = (trx: Kysely<Db>) =>
  ({
    updatePreferences: async (userId, preferences) => {
      const result = await trx
        .updateTable("user")
        .set(preferences)
        .where("id", "=", userId)
        .returning(["id", "email", "activePlan", "activeSubscriptionId", "preferredLocale"])
        .executeTakeFirstOrThrow();

      return result;
    },
    getCurrentUserOrganizations: async (userId) => {
      const organizations = await trx
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
              .whereRef("member.organizationId", "=", "organization.id")
              .select(["member.id", "member.userId", "member.role", "member.createdAt"]),
          ).as("members"),
        ])
        .execute();

      return organizations.map((org) => ({
        ...org,
        createdAt: new Date(org.createdAt),
        members: org.members.map((member) => ({
          ...member,
          createdAt: new Date(member.createdAt),
        })),
      }));
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

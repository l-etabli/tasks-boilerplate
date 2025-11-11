import type { Db } from "@tasks/db";
import { expectToEqual } from "@tasks/test";
import type { Kysely } from "kysely";
import { beforeEach, describe, it } from "vitest";
import { taskFactory } from "../../domain/entities/taskFactory.js";
import type { User } from "../../domain/entities/user-and-organization.js";
import type { TaskRepository } from "../../domain/ports/TaskRepository.js";
import { createPgTaskRepository } from "./taskRepository.js";
import { setupPgIntegrationTest } from "./test-utils/integrationTestHelpers.js";

describe("taskRepository (PostgreSQL)", () => {
  const { getDb, getDefaultUser } = setupPgIntegrationTest();

  let db: Kysely<Db>;
  let taskRepository: TaskRepository;
  let defaultUser: User;

  beforeEach(() => {
    db = getDb();
    taskRepository = createPgTaskRepository(db);
    defaultUser = getDefaultUser();
  });

  describe("save", () => {
    it("should save a task", async () => {
      const task = taskFactory({ owner: defaultUser });
      await taskRepository.save(task);

      const savedTask = await db
        .selectFrom("tasks")
        .where("id", "=", task.id)
        .selectAll()
        .executeTakeFirst();

      expectToEqual(savedTask?.id, task.id);
      expectToEqual(savedTask?.description, task.description);
      expectToEqual(savedTask?.ownerId, defaultUser.id);
    });
  });

  describe("getTaskById", () => {
    it("should retrieve a task with owner", async () => {
      const task = taskFactory({ owner: defaultUser });
      await db
        .insertInto("tasks")
        .values({
          id: task.id,
          description: task.description,
          ownerId: defaultUser.id,
        })
        .execute();

      const retrievedTask = await taskRepository.getTaskById(task.id);

      expectToEqual(retrievedTask, task);
    });

    it("should return undefined for non-existent task", async () => {
      const result = await taskRepository.getTaskById("non-existent-id");
      expectToEqual(result, undefined);
    });
  });

  describe("delete", () => {
    it("should delete a task", async () => {
      const task = taskFactory({ owner: defaultUser });
      await db
        .insertInto("tasks")
        .values({
          id: task.id,
          description: task.description,
          ownerId: defaultUser.id,
        })
        .execute();

      await taskRepository.delete(task.id);

      const deletedTask = await db
        .selectFrom("tasks")
        .where("id", "=", task.id)
        .selectAll()
        .executeTakeFirst();

      expectToEqual(deletedTask, undefined);
    });
  });
});

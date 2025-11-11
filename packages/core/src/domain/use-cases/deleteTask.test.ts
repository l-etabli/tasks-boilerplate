import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../adapters/inMemory/withInMemoryUow.js";
import { taskFactory } from "../entities/taskFactory.js";
import { userFactory } from "../entities/userFactory.js";
import { deleteTask } from "./deleteTask.js";

describe("deleteTask", () => {
  let deleteTaskFn: ReturnType<typeof deleteTask>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    deleteTaskFn = deleteTask({
      withUow: uowConfig.withUow,
    });
  });

  it("should delete an existing task", async () => {
    const task = taskFactory({ owner: currentUser });
    helpers.task.taskById[task.id] = task;

    await deleteTaskFn({ input: { id: task.id }, currentUser });

    expectToEqual(helpers.task.taskById[task.id], undefined);
  });

  it("should throw an error if the task does not belong to the current user", async () => {
    const task = taskFactory({ owner: userFactory() });
    helpers.task.taskById[task.id] = task;

    await expect(deleteTaskFn({ input: { id: task.id }, currentUser })).rejects.toThrow(
      "Task not found",
    );
  });

  it("should handle deleting a non-existent task", async () => {
    await deleteTaskFn({ input: { id: "non-existent" }, currentUser });

    expect(helpers.task.taskById["non-existent"]).toBeUndefined();
  });
});

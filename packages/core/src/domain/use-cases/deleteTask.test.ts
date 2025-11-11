import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, expect, it } from "vitest";
import { expectPromiseToFailWith } from "../../../../test/src/testUtils.js";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../adapters/inMemory/withInMemoryUow.js";
import { taskFactory } from "../entities/taskFactory.js";
import { userFactory } from "../entities/userFactory.js";
import { deleteTaskUseCase } from "./deleteTask.js";

describe("deleteTask", () => {
  let deleteTask: ReturnType<typeof deleteTaskUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    deleteTask = deleteTaskUseCase({
      withUow: uowConfig.withUow,
    });
  });

  it("should delete an existing task", async () => {
    const task = taskFactory({ owner: currentUser });
    helpers.task.taskById[task.id] = task;

    await deleteTask({ input: { id: task.id }, currentUser });

    expectToEqual(helpers.task.taskById[task.id], undefined);
  });

  it("should throw an error if the task is not found", async () => {
    await expectPromiseToFailWith(
      deleteTask({ input: { id: "non-existent" }, currentUser }),
      "Task not found",
    );
  });

  it("should throw an error if the task does not belong to the current user", async () => {
    const task = taskFactory({ owner: userFactory() });
    helpers.task.taskById[task.id] = task;

    await expectPromiseToFailWith(
      deleteTask({ input: { id: task.id }, currentUser }),
      "Not your task",
    );
  });
});

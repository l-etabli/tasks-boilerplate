import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, it } from "vitest";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../../adapters/inMemory/withInMemoryUow.js";
import { userFactory } from "../../user/entities/userFactory.js";
import { addTaskUseCase } from "./addTask.js";

describe("addTask", () => {
  let addTask: ReturnType<typeof addTaskUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    addTask = addTaskUseCase({
      withUow: uowConfig.withUow,
    });
  });

  it("should create a task with the provided input and current user as owner", async () => {
    const input = {
      id: "task-1",
      description: "Test task description",
    };

    await addTask({ input, currentUser });

    const savedTask = helpers.task.taskById[input.id]!;
    expectToEqual(savedTask, {
      id: input.id,
      description: input.description,
      owner: currentUser,
    });
  });
});

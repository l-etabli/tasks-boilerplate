import { createServerFn } from "@tanstack/react-start";
import { addTaskSchema, deleteTaskSchema } from "@tasks/core";
import { authenticated } from "./auth";
import { useCases } from "./bootstrap";

export const listTasks = createServerFn({
  method: "GET",
})
  .middleware([authenticated({ name: "listTasks" })])
  .handler(async ({ context: { currentUser } }) =>
    useCases.queries.task.getAllTasksForUser(currentUser.id),
  );

export const addTask = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "addTask" })])
  .inputValidator(addTaskSchema)
  .handler(async ({ data, context: { currentUser } }) => {
    await useCases.mutations.addTask({
      currentUser,
      input: data,
    });
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "deleteTask" })])
  .inputValidator(deleteTaskSchema)
  .handler(async ({ data, context: { currentUser } }) => {
    await useCases.mutations.deleteTask({
      currentUser,
      input: data,
    });
  });

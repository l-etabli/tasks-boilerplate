import { createServerFn } from "@tanstack/react-start";
import { addTaskSchema, deleteTaskSchema } from "@tasks/core";
import { authenticated } from "./auth";
import { useCases } from "./bootstrap";

export const listTasks = createServerFn({
  method: "GET",
}).handler(
  authenticated({
    name: "listTasks",
    handler: async (ctx) => useCases.queries.task.getAllTasksForUser(ctx.currentUser.id),
  }),
);

export const addTask = createServerFn({ method: "POST" })
  .inputValidator(addTaskSchema)
  .handler(
    authenticated({
      name: "addTask",
      handler: async (ctx) => {
        await useCases.mutations.addTask({
          currentUser: ctx.currentUser,
          input: ctx.data,
        });
      },
    }),
  );

export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator(deleteTaskSchema)
  .handler(
    authenticated({
      name: "deleteTask",
      handler: async (ctx) => {
        await useCases.mutations.deleteTask({
          currentUser: ctx.currentUser,
          input: ctx.data,
        });
      },
    }),
  );

import { createServerFn } from "@tanstack/react-start";
import { addTaskSchema, deleteTaskSchema } from "@tasks/core";
import { authenticated } from "./auth";
import { useCases } from "./bootstrap";

export const listTasks = createServerFn({
  method: "GET",
}).handler(
  authenticated({
    name: "listTasks",
    handler: async (ctx) =>
      useCases.listMyTasks({
        currentUser: ctx.currentUser,
      }),
  }),
);

export const addTask = createServerFn({ method: "POST" })
  .inputValidator(addTaskSchema)
  .handler(
    authenticated({
      name: "addTask",
      handler: async (ctx) => {
        await useCases.addTask({
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
        await useCases.deleteTask({
          currentUser: ctx.currentUser,
          input: ctx.data,
        });
      },
    }),
  );

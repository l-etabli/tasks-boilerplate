import { bootstrapUseCases } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { createAuthenticatedServerFn } from "./createAuthenticatedServerFn";

const useCases = bootstrapUseCases({
  kind: "pg",
  db: getKyselyDb(),
});

export const listTasks = createAuthenticatedServerFn({
  method: "GET",
}).handler(async ({ currentUser }) => {
  return await useCases.listMyTasks({
    currentUser,
  });
});

export const addTask = createAuthenticatedServerFn({ method: "POST" })
  .inputValidator((data: { id: string; description: string }) => data)
  .handler(async ({ data, currentUser }) => {
    await useCases.addTask({
      currentUser,
      input: data,
    });
    return { success: true };
  });

export const deleteTask = createAuthenticatedServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, currentUser }) => {
    await useCases.deleteTask({
      currentUser,
      input: data,
    });
    return { success: true };
  });

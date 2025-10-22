import { createServerFn } from "@tanstack/react-start";
import { bootstrapUseCases } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { getCurrentUserFn } from "./auth";

const useCases = bootstrapUseCases({
  kind: "pg",
  db: getKyselyDb(),
});

export const listTasks = createServerFn({
  method: "GET",
}).handler(async () => {
  const currentUser = await getCurrentUserFn();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  return await useCases.listMyTasks({
    currentUser,
  });
});

export const addTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; description: string }) => data)
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUserFn();

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    await useCases.addTask({
      currentUser,
      input: data,
    });
    return { success: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUserFn();

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    await useCases.deleteTask({
      currentUser,
      input: data,
    });
    return { success: true };
  });

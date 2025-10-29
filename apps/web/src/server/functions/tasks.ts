import * as Sentry from "@sentry/tanstackstart-react";
import { createServerFn } from "@tanstack/react-start";
import { bootstrapUseCases } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { requireUser } from "./auth";

const useCases = bootstrapUseCases({
  kind: "pg",
  db: getKyselyDb(Sentry),
});

export const listTasks = createServerFn({
  method: "GET",
}).handler(async () => {
  return await useCases.listMyTasks({
    currentUser: await requireUser(),
  });
});

export const addTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; description: string }) => data)
  .handler(async ({ data }) => {
    await useCases.addTask({
      currentUser: await requireUser(),
      input: data,
    });
  });

export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await useCases.deleteTask({
      currentUser: await requireUser(),
      input: data,
    });
  });

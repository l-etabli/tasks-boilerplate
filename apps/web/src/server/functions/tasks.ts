import { createServerFn } from "@tanstack/react-start";
import { bootstrapUseCases } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { withServerSpan } from "../../lib/sentry.server";
import { requireUser } from "./auth";

const useCases = bootstrapUseCases({
  kind: "pg",
  db: getKyselyDb(),
});

export const listTasks = createServerFn({
  method: "GET",
}).handler(
  withServerSpan("listTasks", async () => {
    return await useCases.listMyTasks({
      currentUser: await requireUser(),
    });
  }),
);

export const addTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; description: string }) => data)
  .handler(
    withServerSpan("addTask", async ({ data }) => {
      await useCases.addTask({
        currentUser: await requireUser(),
        input: data,
      });
      return { success: true };
    }),
  );

export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(
    withServerSpan("deleteTask", async ({ data }) => {
      await useCases.deleteTask({
        currentUser: await requireUser(),
        input: data,
      });
      return { success: true };
    }),
  );

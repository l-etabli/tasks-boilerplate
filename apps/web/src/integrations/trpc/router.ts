import { addTaskSchema, bootstrapUseCases } from "@tasks/core";
import type { TRPCRouterRecord } from "@trpc/server";

import { createTRPCRouter, privateProcedure, publicProcedure } from "./init";

const useCases = bootstrapUseCases({ uowKind: "in-memory" });

const tasksRouter = {
  list: privateProcedure.query(async ({ ctx: { currentUser } }) =>
    useCases.listMyTasks({ currentUser }),
  ),
  add: privateProcedure
    .input(addTaskSchema)
    .mutation(
      async ({ ctx: { currentUser }, input }) => await useCases.addTask({ currentUser, input }),
    ),
} satisfies TRPCRouterRecord;

const peopleRouter = {
  list: publicProcedure.query(async () =>
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => data as { name: string }[]),
  ),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  people: peopleRouter,
  tasks: tasksRouter,
});
export type TRPCRouter = typeof trpcRouter;

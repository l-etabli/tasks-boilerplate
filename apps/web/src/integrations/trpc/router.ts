import { addTaskSchema, bootstrapUseCases } from "@tasks/core";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server"; // Import TRPCError

import { createTRPCRouter, privateProcedure, publicProcedure } from "./init";

const useCases = bootstrapUseCases({ uowKind: "in-memory" });

const tasksRouter = {
  list: privateProcedure.query(async ({ ctx }) => {
    if (!ctx.currentUser) {
      console.error("currentUser is not available in tasksRouter.list procedure.");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return useCases.listMyTasks({ currentUser: ctx.currentUser });
  }),
  add: privateProcedure.input(addTaskSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.currentUser) {
      console.error("currentUser is not available in tasksRouter.add procedure.");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return useCases.addTask({ currentUser: ctx.currentUser, input });
  }),
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

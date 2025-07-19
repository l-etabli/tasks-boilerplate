import type { User } from "@tasks/core";
import { createSpan, recordException, setUser } from "@tasks/otel/server";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

type Context = {
  currentUser?: User;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure.use(async ({ ctx, next, path, type }) => {
  const procedureName = `${type}.${path}`;
  return await createSpan(procedureName, "trpc.publicProcedure", () => next({ ctx }));
});

export const privateProcedure = t.procedure.use(async ({ ctx, next, path, type }) => {
  const procedureName = `${type}.${path}`;
  return await createSpan(procedureName, "trpc.privateProcedure", () => {
    const currentUser = ctx?.currentUser;
    if (!currentUser) {
      const error = new Error("Unauthorized access attempt");
      recordException(error);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You need to authenticate first" });
    }

    setUser(currentUser.id, currentUser.email);

    return next({ ctx: { currentUser } });
  });
});

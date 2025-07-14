import type { User } from "@tasks/core";
import { Sentry } from "@tasks/sentry/server";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

type Context = {
  currentUser?: User;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure.use(({ ctx, next, path, type }) => {
  const procedureName = `${type}.${path}`;
  return Sentry.startSpan({ op: "trpc.publicProcedure", name: procedureName }, () => next({ ctx }));
});

export const privateProcedure = t.procedure.use(({ ctx, next, path, type }) => {
  const procedureName = `${type}.${path}`;
  return Sentry.startSpan({ op: "trpc.privateProcedure", name: procedureName }, () => {
    const currentUser = ctx?.currentUser;
    if (!currentUser) {
      Sentry.captureException(new Error("Unauthorized access attempt"));
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You need to authenticate first" });
    }

    Sentry.setUser({
      id: currentUser.id,
      email: currentUser.email,
    });

    return next({ ctx: { currentUser } });
  });
});

import type { User } from "@tasks/core";
import { instrumentAsync } from "@tasks/otel";
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
  return instrumentAsync("trpc-procedure", `Public.proc : ${procedureName}`, async () => {
    return next({ ctx });
  });
});

export const privateProcedure = t.procedure.use(({ ctx, next, path, type }) => {
  const procedureName = `${type}.${path}`;
  return instrumentAsync("trpc-procedure", `Private.proc : ${procedureName}`, async () => {
    const currentUser = ctx?.currentUser;
    if (!currentUser) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You need to authenticate first" });
    }

    return next({ ctx: { currentUser } });
  });
});

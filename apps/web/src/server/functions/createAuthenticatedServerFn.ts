import { createServerFn } from "@tanstack/react-start";
import type { User } from "@tasks/core";
import { getCurrentUserFn } from "./auth";

type AuthenticatedHandler<TInput, TOutput> = (context: {
  data: TInput;
  currentUser: User;
}) => Promise<TOutput> | TOutput;

type AuthenticatedHandlerNoInput<TOutput> = (context: {
  currentUser: User;
}) => Promise<TOutput> | TOutput;

export const createAuthenticatedServerFn = <TOptions extends Parameters<typeof createServerFn>[0]>(
  options: TOptions,
) => {
  const serverFn = createServerFn(options);

  return {
    inputValidator: <TInput>(validator: (data: TInput) => TInput) => {
      return {
        handler: <TOutput>(fn: AuthenticatedHandler<TInput, TOutput>) => {
          return (serverFn as any).inputValidator(validator).handler(async (ctx: any) => {
            const currentUser = await getCurrentUserFn();

            if (!currentUser) {
              throw new Error("Unauthorized");
            }

            return fn({ data: ctx.data, currentUser });
          });
        },
      };
    },
    handler: <TOutput>(fn: AuthenticatedHandlerNoInput<TOutput>) => {
      return (serverFn as any).handler(async () => {
        const currentUser = await getCurrentUserFn();

        if (!currentUser) {
          throw new Error("Unauthorized");
        }

        return fn({ currentUser });
      });
    },
  };
};

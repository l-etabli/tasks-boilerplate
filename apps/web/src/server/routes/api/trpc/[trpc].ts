import "../../../instrument-server";
import type { User } from "@tasks/core";
import { Sentry } from "@tasks/sentry/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { defineEventHandler, getHeaders, toWebRequest } from "vinxi/http";
import { trpcRouter } from "@/integrations/trpc/router";
import { auth } from "@/utils/auth";

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
  console.info(`\n----- tRPC route called : ${appAndPath}`);

  return Sentry.startSpan({ op: "tRPC route", name: appAndPath }, async () => {
    return fetchRequestHandler({
      req: request,
      router: trpcRouter,
      endpoint: "/api/trpc",
      createContext: async () => {
        return await Sentry.startSpan(
          { op: "trpc.context", name: "Create tRPC Context" },
          async () => {
            const session = await auth.api.getSession({
              headers: getHeaders() as any,
            });

            // Convert better-auth user to core User type
            const currentUser: User | undefined = session?.user
              ? {
                  id: session.user.id,
                  email: session.user.email,
                  activePlan: session.user.activePlan as "pro" | null,
                  activeSubscriptionId: session.user.activeSubscriptionId,
                  preferredLocale: session.user.preferredLocale as "en" | "fr" | null,
                }
              : undefined;

            return {
              currentUser,
            };
          },
        );
      },
    });
  });
});

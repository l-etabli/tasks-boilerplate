import "../instrument-server";
import { trpcRouter } from "@/integrations/trpc/router";
import { auth } from "@/utils/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getHeaders } from "@tanstack/react-start/server";
import type { User } from "@tasks/core";
import { Sentry } from "@tasks/sentry/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
  const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
  console.info(`\n----- tRPC route called : ${appAndPath}`);
  return Sentry.startSpan({ op: "tRPC route", name: appAndPath }, () => {
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
}

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
});

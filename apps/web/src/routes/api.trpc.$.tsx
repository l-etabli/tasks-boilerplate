import "../instrument-server";
import { authClient } from "@/auth-client";
import { trpcRouter } from "@/integrations/trpc/router";
import { Sentry } from "@l-etabli/sentry/server";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getHeaders } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    createContext: async () => {
      return await Sentry.startSpan(
        { op: "trpc.createContext", name: "Create tRPC Context" },
        async () => {
          const { data: session } = await authClient.getSession({
            fetchOptions: {
              headers: getHeaders() as HeadersInit,
            },
          });

          return {
            currentUser: session?.user,
          };
        },
      );
    },
  });
}

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
});

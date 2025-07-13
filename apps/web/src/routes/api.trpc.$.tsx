import { auth } from "@/utils/auth";
import "../instrument-server";
import { trpcRouter } from "@/integrations/trpc/router";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getHeaders } from "@tanstack/react-start/server";
import { Sentry } from "@tasks/sentry/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
  console.info(`\n----- tRPC route called : ${request.method} ${new URL(request.url).pathname}`);
  console.info({ body: request.body }, "\n----- \n");
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    createContext: async () => {
      return await Sentry.startSpan(
        { op: "trpc.createContext", name: "Create tRPC Context" },
        async () => {
          const session = await auth.api.getSession({
            headers: getHeaders() as any,
          });

          console.info("session.email : ", session?.user?.email);

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

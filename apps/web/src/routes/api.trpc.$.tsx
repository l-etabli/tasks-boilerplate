import "../instrument-server";
import { trpcRouter } from "@/integrations/trpc/router";
import { auth } from "@/utils/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getHeaders } from "@tanstack/react-start/server";
import { instrumentAsync } from "@tasks/otel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
  const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
  console.info(`\n----- tRPC route called : ${appAndPath}`);

  return instrumentAsync("trpc-handler", "tRPC Handler", async () => {
    return fetchRequestHandler({
      req: request,
      router: trpcRouter,
      endpoint: "/api/trpc",
      createContext: async () => {
        return await instrumentAsync("trpc-context", "tRPC Context", async () => {
          const session = await auth.api.getSession({
            headers: getHeaders() as any,
          });

          return {
            currentUser: session?.user,
          };
        });
      },
    });
  });
}

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
});

import { env } from "@/env";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/health")({
  GET: () =>
    new Response(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    ),
});

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const timestamp = new Date().toISOString();

        try {
          const { useCases } = await import("@/server/functions/bootstrap");
          await useCases.queries.health?.checkHealth();

          return new Response(
            JSON.stringify({
              status: "ok",
              timestamp,
              database: "connected",
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              status: "error",
              timestamp,
              database: "disconnected",
              error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
              status: 503,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      },
    },
  },
});

import "../instrument-server";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/demo-names")({
  GET: async () => {
    return new Response(JSON.stringify(["Alice", "Bob", "Charlie"]), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
});

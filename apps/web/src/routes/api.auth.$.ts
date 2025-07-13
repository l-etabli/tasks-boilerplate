import "../instrument-server";
import { auth } from "@/utils/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";

const log = (request: Request) =>
  console.info(`Auth route : ${request.method} ${new URL(request.url).pathname}`);

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    log(request);
    return auth.handler(request);
  },
  POST: ({ request }) => {
    log(request);
    return auth.handler(request);
  },
});

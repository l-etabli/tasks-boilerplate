import "../instrument-server";
import { auth } from "@/utils/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";

const log = (appAndPath: string) => console.info(`Auth route : ${appAndPath}`);

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
    log(appAndPath);
    return auth.handler(request);
  },
  POST: ({ request }) => {
    const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
    log(appAndPath);
    return auth.handler(request);
  },
});

import "../instrument-server";
import { auth } from "@/utils/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createSpan } from "@tasks/otel/server";

const log = (appAndPath: string) => console.info(`Auth route : ${appAndPath}`);

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
    log(appAndPath);
    return createSpan(appAndPath, appAndPath, () => {
      return auth.handler(request);
    });
  },
  POST: ({ request }) => {
    const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
    log(appAndPath);
    return createSpan(appAndPath, appAndPath, () => {
      return auth.handler(request);
    });
  },
});

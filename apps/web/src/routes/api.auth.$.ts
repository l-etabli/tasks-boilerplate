import "../instrument-server";
import { auth } from "@/utils/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { Sentry } from "@tasks/sentry/server";

const log = (appAndPath: string) => console.info(`Auth route : ${appAndPath}`);

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
    log(appAndPath);
    return Sentry.startSpan({ op: "better-aut", name: appAndPath }, () => {
      return auth.handler(request);
    });
  },
  POST: ({ request }) => {
    const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
    log(appAndPath);
    return Sentry.startSpan({ op: "better-aut", name: appAndPath }, () => {
      return auth.handler(request);
    });
  },
});

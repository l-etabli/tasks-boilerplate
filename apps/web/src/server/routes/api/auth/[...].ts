import "../../../instrument-server";
import { Sentry } from "@tasks/sentry/server";
import { defineEventHandler } from "vinxi/http";
import { auth } from "@/utils/auth";

const log = (appAndPath: string) => console.info(`Auth route : ${appAndPath}`);

export default defineEventHandler(async (event) => {
  const request = event.node.req as unknown as Request;
  const appAndPath = `${request.method} ${new URL(request.url).pathname}`;
  log(appAndPath);

  return Sentry.startSpan({ op: "better-auth", name: appAndPath }, () => {
    return auth.handler(request);
  });
});

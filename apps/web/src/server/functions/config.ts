import { createServerFn } from "@tanstack/react-start";
import { env } from "@/env";

export type RuntimeConfig = {
  environment: "local" | "development" | "staging" | "production";
  umamiWebsiteId: string | null;
  umamiScriptUrl: string | null;
};

export const getRuntimeConfig = createServerFn({ method: "GET" }).handler((): RuntimeConfig => {
  return {
    environment: env.ENVIRONMENT,
    umamiWebsiteId: env.UMAMI_WEBSITE_ID ?? null,
    umamiScriptUrl: env.UMAMI_SCRIPT_URL ?? null,
  };
});

import { createServerFn } from "@tanstack/react-start";
import { env } from "@/env";

export const healthCheck = createServerFn({ method: "GET" }).handler(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT,
  };
});

export const getDemoNames = createServerFn({ method: "GET" }).handler(() => {
  return ["Alice", "Bob", "Charlie"];
});

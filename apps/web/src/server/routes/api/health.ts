import { defineEventHandler } from "vinxi/http";
import { env } from "@/env";

export default defineEventHandler(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT,
  };
});

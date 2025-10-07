import { env } from "@/env";
import { defineEventHandler } from "vinxi/http";

export default defineEventHandler(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT,
  };
});

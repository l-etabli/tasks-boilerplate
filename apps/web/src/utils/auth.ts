import { env } from "@/env";
import { betterAuth } from "better-auth";
import { pgPool } from "./database";

export const auth = betterAuth({
  database: pgPool,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

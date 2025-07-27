import "../instrument-server";
import { env } from "@/env";
import { createPgPool } from "@tasks/db";
import { Sentry } from "@tasks/sentry/server";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  user: {
    additionalFields: {
      activePlan: {
        type: ["pro"],
        input: false,
      },
      activeSubscriptionId: {
        type: "string",
        input: false,
      },
      preferredLocale: {
        type: ["en", "fr"],
        input: false,
      },
    },
  },
  database: createPgPool(Sentry),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },
});

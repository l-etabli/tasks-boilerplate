import { env } from "@/env";
import { createPgPool } from "@tasks/db";
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
    },
  },
  database: createPgPool(),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

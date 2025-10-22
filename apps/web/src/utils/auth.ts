import { getKyselyDb } from "@tasks/db";
import { betterAuth } from "better-auth";
import { reactStartCookies } from "better-auth/react-start";

export const auth = betterAuth({
  database: {
    db: getKyselyDb(),
    type: "postgres",
  },

  user: {
    additionalFields: {
      activePlan: {
        type: "string",
        required: false,
      },
      activeSubscriptionId: {
        type: "string",
        required: false,
      },
      preferredLocale: {
        type: "string",
        required: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [reactStartCookies()],
});

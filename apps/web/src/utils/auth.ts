import * as Sentry from "@sentry/tanstackstart-react";
import { getKyselyDb } from "@tasks/db";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { organization } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { env } from "@/env";
import { setPreferencesCookie } from "./preferences";

export const auth = betterAuth({
  database: {
    db: getKyselyDb(Sentry),
    type: "postgres",
  },

  user: {
    additionalFields: {
      preferences: {
        type: "json",
        required: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache (we read cookies server-side so this is safe now)
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Sync cookie to DB preferences after OAuth login
      if (ctx.path.includes("/callback/")) {
        const newSession = ctx.context.newSession;
        if (newSession?.user?.preferences) {
          const cookieHeader = setPreferencesCookie(newSession.user.preferences);
          ctx.setHeader("Set-Cookie", cookieHeader);
        }
      }
    }),
  },

  plugins: [
    reactStartCookies(),
    organization({
      // Allow users to create organizations
      allowUserToCreateOrganization: true,

      // Max organizations per user (adjust for your use case)
      organizationLimit: 10,

      // Max members per organization
      membershipLimit: 100,

      // Role assigned to organization creator
      creatorRole: "owner",

      // Invitation expires after 48 hours
      invitationExpiresIn: 60 * 60 * 48,

      // Send invitation emails via email service
      async sendInvitationEmail(data) {
        const { sendInvitationEmail } = await import("./email.js");

        const acceptInvitationUrl = `${env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;

        await sendInvitationEmail({
          to: data.email,
          inviterName: data.inviter.user.name,
          inviterEmail: data.inviter.user.email,
          organizationName: data.organization.name,
          invitationId: data.id,
          acceptInvitationUrl,
        });
      },
    }),
  ],
});

import { getKyselyDb } from "@tasks/db";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
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

        const acceptInvitationUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/accept-invitation/${data.id}`;

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

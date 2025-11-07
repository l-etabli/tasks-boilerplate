import * as Sentry from "@sentry/tanstackstart-react";
import {
  buildInvitationEmail,
  buildPasswordResetEmail,
  buildVerificationEmail,
} from "@tasks/core/emails";
import { getKyselyDb } from "@tasks/db";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import type { User } from "better-auth/db";
import { type Member, type Organization, organization } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { env } from "@/env";
import type { Locales } from "@/i18n/i18n-types";
import { gateways } from "@/server/functions/bootstrap";
import { fallbackLocale } from "@/utils/localeUtils";
import { getPreferencesCookie, setPreferencesCookie } from "./preferences";
import { buildUrl } from "./url-builder";

/**
 * Extract locale from request cookies with fallback
 */
function getLocaleFromRequest(request?: Request): Locales {
  const cookieHeader = request?.headers.get("cookie") ?? undefined;
  const preferences = getPreferencesCookie(cookieHeader);
  return preferences?.locale || fallbackLocale;
}

const db = getKyselyDb(Sentry);

export const auth = betterAuth({
  database: {
    db,
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

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url }, request) {
      const email = buildPasswordResetEmail({
        to: [{ email: user.email, name: user.name }],
        locale: getLocaleFromRequest(request),
        params: {
          userName: user.name,
          resetUrl: url,
        },
      });

      await gateways.email.send(email);
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const email = buildVerificationEmail({
        to: [{ email: user.email, name: user.name }],
        locale: getLocaleFromRequest(request),
        params: {
          userName: user.name,
          verificationUrl: url,
        },
      });

      await gateways.email.send(email);
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

      // Require email verification to accept invitations
      // Users must verify their email before accepting invitations
      requireEmailVerificationOnInvitation: true,

      // Send invitation emails via email gateway
      async sendInvitationEmail(data, request) {
        const pathname = buildUrl("/accept-invitation/$invitationId", {
          invitationId: data.id,
        });
        const acceptInvitationUrl = `${env.BETTER_AUTH_URL}${pathname}`;

        const email = buildInvitationEmail({
          to: [{ email: data.email }],
          locale: getLocaleFromRequest(request),
          params: {
            inviterName: data.inviter.user.name,
            organizationName: data.organization.name,
            acceptInvitationUrl,
          },
        });

        await gateways.email.send(email);
      },

      // Server-side validation for role changes
      async beforeUpdateMemberRole(data: {
        member: Member & Record<string, any>;
        newRole: string;
        user: User & Record<string, any>;
        organization: Organization & Record<string, any>;
      }) {
        const { member, newRole, user, organization } = data;

        // Prevent users from changing their own role
        if (user.id === member.userId) {
          throw new Error("You cannot change your own role");
        }

        // Get current user's role in the organization
        const currentUserMember = await db
          .selectFrom("member")
          .select(["role"])
          .where("organizationId", "=", organization.id)
          .where("userId", "=", user.id)
          .executeTakeFirst();

        if (!currentUserMember) {
          throw new Error("You are not a member of this organization");
        }

        const currentUserRole = currentUserMember.role;

        // Only owners can promote to owner or demote from owner
        if ((newRole === "owner" || member.role === "owner") && currentUserRole !== "owner") {
          throw new Error("Only owners can change owner roles");
        }

        // Prevent demoting the last owner
        if (member.role === "owner" && newRole !== "owner") {
          const ownerCount = await db
            .selectFrom("member")
            .select(db.fn.count<number>("id").as("count"))
            .where("organizationId", "=", organization.id)
            .where("role", "=", "owner")
            .executeTakeFirst();

          if (ownerCount && ownerCount.count <= 1) {
            throw new Error("Cannot demote the last owner");
          }
        }

        return {
          data: {
            role: newRole,
          },
        };
      },
    }),
  ],
});

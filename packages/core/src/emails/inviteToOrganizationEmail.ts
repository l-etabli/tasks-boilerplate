import type { Email, EmailParams } from "./emailUtils.js";
import { type EmailTranslations, getTranslation } from "./translations.js";

type InviteToOrganizationEmailParams = {
  inviterName: string;
  organizationName: string;
  acceptInvitationUrl: string;
};

const translations: EmailTranslations<
  (params: InviteToOrganizationEmailParams) => Pick<Email, "subject" | "body">
> = {
  en: ({ inviterName, organizationName, acceptInvitationUrl }) => ({
    subject: `You've been invited to join ${organizationName}`,
    body: `
      <h1>Organization Invitation</h1>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong>.</p>
      <p><a href="${acceptInvitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
      <p>This invitation will expire in 48 hours.</p>
    `,
  }),
  fr: ({ inviterName, organizationName, acceptInvitationUrl }) => ({
    subject: `Vous avez été invité à rejoindre ${organizationName}`,
    body: `
      <h1>Invitation à l'organisation</h1>
      <p>${inviterName} vous a invité à rejoindre <strong>${organizationName}</strong>.</p>
      <p><a href="${acceptInvitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Accepter l'invitation</a></p>
      <p>Cette invitation expirera dans 48 heures.</p>
    `,
  }),
};

export const buildInviteToOrganizationEmail = ({
  to,
  cc,
  bcc,
  locale,
  params,
}: EmailParams<InviteToOrganizationEmailParams>): Email => {
  const buildEmail = getTranslation(translations, locale);
  const { subject, body } = buildEmail(params);

  return {
    to,
    cc,
    bcc,
    subject,
    body,
  };
};

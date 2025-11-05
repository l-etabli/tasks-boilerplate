import type { Email } from "../domain/ports/EmailGateway.js";
import type { EmailParams } from "./emailUtils.js";

export const buildInvitationEmail = ({
  to,
  cc,
  bcc,
  params,
}: EmailParams<{
  inviterName: string;
  organizationName: string;
  acceptInvitationUrl: string;
}>): Email => {
  const { inviterName, organizationName, acceptInvitationUrl } = params;

  return {
    to,
    cc,
    bcc,
    subject: `You've been invited to join ${organizationName}`,
    body: `
      <h1>Organization Invitation</h1>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong>.</p>
      <p><a href="${acceptInvitationUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 48 hours.</p>
    `,
  };
};

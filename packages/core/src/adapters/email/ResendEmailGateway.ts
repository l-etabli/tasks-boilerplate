import type { Resend } from "resend";
import type {
  EmailGateway,
  EmailRecipient,
  EmailRequest,
  EmailTemplate,
} from "../../domain/shared/ports/EmailGateway.js";
import type { Email } from "../../emails/emailUtils.js";
import { buildInviteToOrganizationEmail } from "../../emails/inviteToOrganizationEmail.js";
import { buildPasswordResetEmail } from "../../emails/passwordResetEmail.js";
import { buildVerificationEmail } from "../../emails/verificationEmail.js";

const formatRecipient = (recipient: EmailRecipient): string =>
  recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;

export const createResendEmailGateway = (resend: Resend, from: string): EmailGateway => {
  const emailBuilders = {
    verifyEmail: buildVerificationEmail,
    resetPassword: buildPasswordResetEmail,
    inviteToOrganization: buildInviteToOrganizationEmail,
  } satisfies Record<EmailTemplate["templateName"], (request: never) => Email>;

  return {
    async send(request: EmailRequest): Promise<void> {
      const email = emailBuilders[request.templateName](request as never);

      await resend.emails.send({
        from,
        to: email.to.map(formatRecipient),
        cc: email.cc?.map(formatRecipient),
        bcc: email.bcc?.map(formatRecipient),
        subject: email.subject,
        html: email.body,
      });
    },
  };
};

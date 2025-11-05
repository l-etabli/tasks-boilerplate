import type { Resend } from "resend";
import type { Email, EmailGateway, EmailRecipient } from "../../domain/ports/EmailGateway.js";

const formatRecipient = (recipient: EmailRecipient): string =>
  recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;

export const createResendEmailGateway = (resend: Resend, defaultFrom: string): EmailGateway => {
  return {
    async send(email: Email): Promise<void> {
      const from = email.from ? formatRecipient(email.from) : defaultFrom;

      await resend.emails.send({
        from,
        to: email.to.map(formatRecipient),
        subject: email.subject,
        html: email.body,
        cc: email.cc?.map(formatRecipient),
        bcc: email.bcc?.map(formatRecipient),
      });
    },
  };
};

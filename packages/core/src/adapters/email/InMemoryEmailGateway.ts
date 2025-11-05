import type { Email, EmailGateway, EmailRecipient } from "../../domain/ports/EmailGateway.js";

const formatRecipient = (recipient: EmailRecipient): string => {
  return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
};

export const createInMemoryEmailGateway = (defaultFrom: string): EmailGateway => {
  return {
    async send(email: Email): Promise<void> {
      const from = email.from ? formatRecipient(email.from) : defaultFrom;

      console.info("\n\n===== EMAIL =====");
      console.info(`From: ${from}`);
      console.info(`To: ${email.to.map(formatRecipient).join(", ")}`);
      if (email.cc?.length) {
        console.info(`CC: ${email.cc.map(formatRecipient).join(", ")}`);
      }
      if (email.bcc?.length) {
        console.info(`BCC: ${email.bcc.map(formatRecipient).join(", ")}`);
      }
      console.info(`Subject: ${email.subject}`);
      console.info("Body:");
      console.info(email.body);
      console.info("=================\n\n");
    },
  };
};

import type {
  EmailGateway,
  EmailRecipient,
  EmailRequest,
} from "../../domain/shared/ports/EmailGateway.js";

const formatRecipient = (recipient: EmailRecipient): string => {
  return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
};

export type InMemoryEmailGatewayInstance = EmailGateway & {
  getSentEmails: () => EmailRequest[];
  clearSentEmails: () => void;
};

export const createInMemoryEmailGateway = (from: string): InMemoryEmailGatewayInstance => {
  const sentEmails: EmailRequest[] = [];

  return {
    async send(request: EmailRequest): Promise<void> {
      sentEmails.push(request);

      console.info("\n \n ------ 📧 Email sent (in-memory) ------ \n", {
        templateName: request.templateName,
        from,
        to: request.to.map(formatRecipient).join(", "),
        cc: request.cc?.map(formatRecipient).join(", "),
        bcc: request.bcc?.map(formatRecipient).join(", "),
        params: request.params,
      });
      console.info("---------------\n \n");
    },

    getSentEmails: () => sentEmails,
    clearSentEmails: () => {
      sentEmails.length = 0;
    },
  };
};

import type { Locales } from "../../../emails/emailUtils.js";

export type EmailRecipient = {
  email: string;
  name?: string;
};

export type EmailTemplate =
  | {
      templateName: "verifyEmail";
      params: { userName: string; verificationUrl: string };
    }
  | {
      templateName: "resetPassword";
      params: { userName: string; resetUrl: string };
    }
  | {
      templateName: "inviteToOrganization";
      params: {
        inviterName: string;
        organizationName: string;
        acceptInvitationUrl: string;
      };
    };

export type EmailRequest = EmailTemplate & {
  to: EmailRecipient[];
  locale: Locales;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
};

export type EmailGateway = {
  send(request: EmailRequest): Promise<void>;
};

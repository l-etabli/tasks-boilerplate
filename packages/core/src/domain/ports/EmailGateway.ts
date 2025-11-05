export type EmailRecipient = {
  email: string;
  name?: string;
};

export type Email = {
  to: EmailRecipient[];
  from?: EmailRecipient;
  subject: string;
  body: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
};

export type EmailGateway = {
  send(email: Email): Promise<void>;
};

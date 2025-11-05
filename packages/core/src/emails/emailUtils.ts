import type { EmailRecipient } from "../domain/ports/EmailGateway.js";

export type EmailParams<T> = {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  params: T;
};

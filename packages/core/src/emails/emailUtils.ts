import type { EmailRecipient } from "../domain/shared/ports/EmailGateway.js";

/**
 * Supported locales for emails
 * IMPORTANT: Keep in sync with apps/web/src/i18n/i18n-types.ts
 * When adding a new locale:
 * 1. Add it here
 * 2. Add translations in all email builders
 * 3. TypeScript will enforce completeness via Record<Locales, T>
 */
export type Locales = "en" | "fr";

export type EmailParams<T> = {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  locale: Locales;
  params: T;
};

export type Email = {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  body: string;
};

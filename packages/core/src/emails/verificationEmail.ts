import type { Email, EmailParams } from "./emailUtils.js";
import { type EmailTranslations, getTranslation } from "./translations.js";

type VerificationEmailParams = {
  userName: string;
  verificationUrl: string;
};

const translations: EmailTranslations<
  (params: VerificationEmailParams) => Pick<Email, "subject" | "body">
> = {
  en: ({ userName, verificationUrl }) => ({
    subject: "Verify your email address",
    body: `
      <h1>Email Verification</h1>
      <p>Hi ${userName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
  }),
  fr: ({ userName, verificationUrl }) => ({
    subject: "Vérifiez votre adresse e-mail",
    body: `
      <h1>Vérification de l'e-mail</h1>
      <p>Bonjour ${userName},</p>
      <p>Veuillez vérifier votre adresse e-mail en cliquant sur le lien ci-dessous :</p>
      <p><a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Vérifier l'e-mail</a></p>
      <p>Ou copiez et collez cette URL dans votre navigateur :</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail en toute sécurité.</p>
    `,
  }),
};

export const buildVerificationEmail = ({
  to,
  cc,
  bcc,
  locale,
  params,
}: EmailParams<VerificationEmailParams>): Email => {
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

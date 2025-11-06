import type { Email } from "../domain/ports/EmailGateway.js";
import type { EmailParams } from "./emailUtils.js";
import { type EmailTranslations, getTranslation } from "./translations.js";

type PasswordResetEmailParams = {
  userName: string;
  resetUrl: string;
};

const translations: EmailTranslations<
  (params: PasswordResetEmailParams) => Pick<Email, "subject" | "body">
> = {
  en: ({ userName, resetUrl }) => ({
    subject: "Reset your password",
    body: `
      <h1>Password Reset Request</h1>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the link below to choose a new password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    `,
  }),
  fr: ({ userName, resetUrl }) => ({
    subject: "Réinitialisez votre mot de passe",
    body: `
      <h1>Demande de réinitialisation de mot de passe</h1>
      <p>Bonjour ${userName},</p>
      <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px;">Réinitialiser le mot de passe</a></p>
      <p>Ou copiez et collez cette URL dans votre navigateur :</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe ne sera pas modifié.</p>
    `,
  }),
};

export const buildPasswordResetEmail = ({
  to,
  cc,
  bcc,
  locale,
  params,
}: EmailParams<PasswordResetEmailParams>): Email => {
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

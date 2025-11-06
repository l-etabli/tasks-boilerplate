import type { Email } from "../domain/ports/EmailGateway.js";
import type { EmailParams } from "./emailUtils.js";

export const buildVerificationEmail = ({
  to,
  cc,
  bcc,
  params,
}: EmailParams<{
  userName: string;
  verificationUrl: string;
}>): Email => {
  const { userName, verificationUrl } = params;

  return {
    to,
    cc,
    bcc,
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
  };
};

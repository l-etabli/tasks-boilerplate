import type { Email } from "../domain/ports/EmailGateway.js";
import type { EmailParams } from "./emailUtils.js";

export const buildPasswordResetEmail = ({
  to,
  cc,
  bcc,
  params,
}: EmailParams<{
  userName: string;
  resetUrl: string;
}>): Email => {
  const { userName, resetUrl } = params;

  return {
    to,
    cc,
    bcc,
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
  };
};

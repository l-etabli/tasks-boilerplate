/**
 * Email service for organization invitations
 *
 * This is a placeholder implementation. Replace with your preferred email provider:
 * - Resend: https://resend.com/docs/send-with-nodejs
 * - SendGrid: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started
 * - Postmark: https://postmarkapp.com/developer/user-guide/send-email-with-api
 * - NodeMailer: https://nodemailer.com/about/
 */

export type SendInvitationEmailParams = {
  to: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  invitationId: string;
  acceptInvitationUrl: string;
};

/**
 * Send organization invitation email
 *
 * TODO: Implement with your email provider
 * Environment variables needed (example for Resend):
 * - RESEND_API_KEY
 * - EMAIL_FROM (e.g., "noreply@yourdomain.com")
 */
export async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<void> {
  const { to, inviterName, organizationName, acceptInvitationUrl } = params;

  // Example with Resend (commented out - uncomment and configure):
  /*
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <h1>Organization Invitation</h1>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong>.</p>
      <p><a href="${acceptInvitationUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 48 hours.</p>
    `,
  });
  */

  // Development fallback - log to console
  if (process.env.NODE_ENV === "development") {
    // biome-ignore lint: Development logging
    console.log("===== EMAIL INVITATION =====");
    // biome-ignore lint: Development logging
    console.log(`To: ${to}`);
    // biome-ignore lint: Development logging
    console.log(`From: ${inviterName} (${organizationName})`);
    // biome-ignore lint: Development logging
    console.log(`Link: ${acceptInvitationUrl}`);
    // biome-ignore lint: Development logging
    console.log("============================");
  }

  // Production without email provider configured - throw error
  if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY) {
    throw new Error(
      "Email service not configured. Set RESEND_API_KEY or implement alternative provider in apps/web/src/utils/email.ts",
    );
  }
}

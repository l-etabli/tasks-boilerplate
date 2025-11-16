export type { Locales } from "./emailUtils.js";

import { buildInviteToOrganizationEmail } from "./inviteToOrganizationEmail.js";
import { buildPasswordResetEmail } from "./passwordResetEmail.js";
import { buildVerificationEmail } from "./verificationEmail.js";

export const emails = {
  user: {
    passwordReset: buildPasswordResetEmail,
    verification: buildVerificationEmail,
    inviteToOrganization: buildInviteToOrganizationEmail,
  },
};

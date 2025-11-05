export type AuthDatabase = {
  account: Account;
  session: Session;
  user: User;
  verification: Verification;
  organization: Organization;
  member: Member;
  invitation: Invitation;
};

interface Account {
  accessToken: string | null;
  accessTokenExpiresAt: Date | null;
  accountId: string;
  createdAt: Date;
  id: string;
  idToken: string | null;
  password: string | null;
  providerId: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  updatedAt: Date;
  userId: string;
}

interface Session {
  createdAt: Date;
  expiresAt: Date;
  id: string;
  ipAddress: string | null;
  token: string;
  updatedAt: Date;
  userAgent: string | null;
  userId: string;
  activeOrganizationId: string | null;
}

interface User {
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  preferences: { locale?: "en" | "fr"; theme?: "light" | "dark" | "system" } | null;
  updatedAt: Date;
}

interface Verification {
  createdAt: Date | null;
  expiresAt: Date;
  id: string;
  identifier: string;
  updatedAt: Date | null;
  value: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: string | null;
  createdAt: Date;
}

type OrganizationRole = "member" | "admin" | "owner";

interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
}

interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole | null;
  status: string;
  expiresAt: Date;
  inviterId: string;
}

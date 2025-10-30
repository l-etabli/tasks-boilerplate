import type { ColumnType } from "kysely";

export type AuthDatabase = {
  account: Account;
  session: Session;
  user: User;
  verification: Verification;
  organization: Organization;
  member: Member;
  invitation: Invitation;
};

type Timestamp = ColumnType<Date, Date | string, Date | string>;

interface Account {
  accessToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  accountId: string;
  createdAt: Timestamp;
  id: string;
  idToken: string | null;
  password: string | null;
  providerId: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  updatedAt: Timestamp;
  userId: string;
}

interface Session {
  createdAt: Timestamp;
  expiresAt: Timestamp;
  id: string;
  ipAddress: string | null;
  token: string;
  updatedAt: Timestamp;
  userAgent: string | null;
  userId: string;
  activeOrganizationId: string | null;
}

interface User {
  createdAt: Timestamp;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  preferences: { locale?: "en" | "fr" } | null;
  updatedAt: Timestamp;
}

interface Verification {
  createdAt: Timestamp | null;
  expiresAt: Timestamp;
  id: string;
  identifier: string;
  updatedAt: Timestamp | null;
  value: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  metadata: string | null;
  createdAt: Timestamp;
}

interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Timestamp;
}

interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Timestamp;
  inviterId: string;
}

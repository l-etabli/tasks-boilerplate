import type { ColumnType } from "kysely";

export type AuthDatabase = {
  account: Account;
  session: Session;
  user: User;
  verification: Verification;
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
}

interface User {
  activePlan: "pro" | null;
  activeSubscriptionId: string | null;
  createdAt: Timestamp;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
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

import { z } from "zod";

export type UserPreferences = { locale?: "en" | "fr"; theme?: "light" | "dark" | "system" } | null;

export type User = {
  id: string;
  email: string;
  name: string | null;
  preferences: UserPreferences;
};

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
export const updateUserPreferencesSchema = z.object({
  locale: z.enum(["en", "fr"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export type OrganizationMember = {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  name: string | null;
  email: string;
};

export type OrganizationInvitation = {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  inviterName: string | null;
  inviterEmail: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  metadata: string | null;
  createdAt: Date;
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
  role: string | null;
};

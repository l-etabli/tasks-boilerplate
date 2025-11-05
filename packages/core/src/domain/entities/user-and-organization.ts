import { z } from "zod";

/**
 * Sanitizes a string to be used as a valid organization slug.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes all non-alphanumeric characters except hyphens
 * - Returns a slug matching the pattern: /^[a-z0-9-]+$/
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export type UserPreferences = { locale?: "en" | "fr"; theme?: "light" | "dark" | "system" } | null;

export type OrganizationRole = "member" | "admin" | "owner";

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
  role: OrganizationRole;
  createdAt: Date;
  name: string | null;
  email: string;
};

export type OrganizationInvitation = {
  id: string;
  email: string;
  role: OrganizationRole | null;
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
};

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  logo: z.string().optional(),
  metadata: z.string().optional(),
});

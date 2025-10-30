import { z } from "zod";

export type UserPreferences = { locale?: "en" | "fr" } | null;

export type User = {
  id: string;
  email: string;
  preferences: UserPreferences;
};

type Pretty<T> = { [K in keyof T]: T[K] };

export type UpdateUserPreferencesInput = Pretty<z.infer<typeof updateUserPreferencesSchema>>;
export const updateUserPreferencesSchema = z.object({
  locale: z.enum(["en", "fr"]).optional(),
});

export type OrganizationMember = {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
};

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  metadata: string | null;
  createdAt: Date;
  members: OrganizationMember[];
  role: string | null;
};

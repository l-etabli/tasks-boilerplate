import { z } from "zod";

export type User = {
  id: string;
  email: string;
  activePlan: "pro" | null;
  activeSubscriptionId: string | null;
  preferredLocale: "en" | "fr" | null;
};

export type Task = {
  id: string;
  description: string;
  owner: User;
};

type Pretty<T> = { [K in keyof T]: T[K] };

export type AddTaskInput = Pretty<z.infer<typeof addTaskSchema>>;
export const addTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export type DeleteTaskInput = Pretty<z.infer<typeof deleteTaskSchema>>;
export const deleteTaskSchema = z.object({
  id: z.string(),
});

export type Subscription = {
  id: string;
  plan: "pro";
  createdAt: Date;
  expiresAt: Date;
  isTrial: boolean;
};

export type UpdateUserPreferencesInput = Pretty<z.infer<typeof updateUserPreferencesSchema>>;
export const updateUserPreferencesSchema = z.object({
  preferredLocale: z.enum(["en", "fr"]).nullable(),
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

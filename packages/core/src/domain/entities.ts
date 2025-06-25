import { z } from "zod";

export type User = {
  id: string;
  email: string;
  activePlan: "pro" | null;
  activeSubscriptionId: string | null;
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

export type Subscription = {
  id: string;
  plan: "pro";
  createdAt: Date;
  expiresAt: Date;
  isTrial: boolean;
};

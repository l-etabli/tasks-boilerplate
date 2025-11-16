import { z } from "zod";
import type { User } from "../../user/entities/user-and-organization.js";

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

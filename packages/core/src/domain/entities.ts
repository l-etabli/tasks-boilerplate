import { z } from "zod";

export type User = {
  id: string;
  email: string;
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

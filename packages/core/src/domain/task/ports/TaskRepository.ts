import type { Task } from "../entities/task.js";

export type TaskRepository = {
  getTaskById: (taskId: string) => Promise<Task | undefined>;
  save: (task: Task) => Promise<void>;
  delete: (taskId: string) => Promise<void>;
};

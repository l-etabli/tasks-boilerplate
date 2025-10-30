import type { Task } from "../entities/task.js";

export type TaskRepository = {
  save: (task: Task) => Promise<void>;
  delete: (taskId: string) => Promise<void>;
};

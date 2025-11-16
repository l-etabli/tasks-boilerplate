import type { Task } from "../entities/task.js";

export type TaskQueries = {
  getAllTasksForUser: (userId: string) => Promise<Task[]>;
};

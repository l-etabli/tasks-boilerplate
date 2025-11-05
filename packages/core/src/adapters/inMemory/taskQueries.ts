import type { Task } from "../../domain/entities/task.js";
import type { TaskQueries } from "../../domain/ports/TaskQueries.js";

export const createInMemoryTaskQueries = (taskById: Record<string, Task>): TaskQueries => ({
  getAllTasksForUser: async (userId) =>
    Object.values(taskById).filter((task) => task.owner.id === userId),
});

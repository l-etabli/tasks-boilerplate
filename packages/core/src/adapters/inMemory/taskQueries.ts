import type { TaskQueries } from "../../domain/task/ports/TaskQueries.js";
import type { TaskRepositoryHelpers } from "./taskRepository.js";

export const createInMemoryTaskQueries = (helpers: TaskRepositoryHelpers): TaskQueries => {
  const { taskById } = helpers;
  return {
    getAllTasksForUser: async (userId) =>
      Object.values(taskById).filter((task) => task.owner.id === userId),
  };
};

import type { Task } from "../../domain/entities/task.js";
import type { TaskRepository } from "../../domain/ports/TaskRepository.js";

export type TaskRepositoryHelpers = {
  taskById: Record<string, Task>;
};

export const createInMemoryTaskRepository = (): {
  taskRepository: TaskRepository;
  helpers: TaskRepositoryHelpers;
} => {
  const taskById: Record<string, Task> = {};
  return {
    taskRepository: {
      save: async (task) => {
        taskById[task.id] = task;
      },
      delete: async (taskId) => {
        delete taskById[taskId];
      },
    },
    helpers: {
      taskById,
    },
  };
};

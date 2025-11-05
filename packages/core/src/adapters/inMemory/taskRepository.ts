import type { Task } from "../../domain/entities/task.js";
import type { TaskRepository } from "../../domain/ports/TaskRepository.js";

export const createInMemoryTaskRepository = (taskById: Record<string, Task>) =>
  ({
    save: async (task) => {
      taskById[task.id] = task;
    },
    delete: async (taskId) => {
      delete taskById[taskId];
    },
  }) satisfies TaskRepository;

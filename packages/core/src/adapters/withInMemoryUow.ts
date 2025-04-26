import type { Task, TaskRepository, WithUow } from "../domain/entities-and-ports.js";

type InMemoryTaskRepository = ReturnType<typeof createInMemoryTaskRepositiory>;
export const createInMemoryTaskRepositiory = () => {
  const taskById: Record<string, Task> = {};

  return {
    getAllForUser: async (userId) =>
      Object.values(taskById).filter((task) => task.owner.id === userId),
    save: async (task) => {
      taskById[task.id] = task;
    },
  } satisfies TaskRepository;
};

type InMemoryUow = {
  taskRepositiory: InMemoryTaskRepository;
};

export const withInMemoryUnitOfWork: WithUow = (cb) =>
  cb({ taskRepository: createInMemoryTaskRepositiory() });

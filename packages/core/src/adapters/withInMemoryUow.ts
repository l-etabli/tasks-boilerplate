import type { Task } from "../domain/entities.js";
import type { TaskRepository, WithUow } from "../domain/ports.js";

// type InMemoryTaskRepository = ReturnType<typeof createInMemoryTaskRepositiory>;
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

// type InMemoryUow = {
//   taskRepositiory: InMemoryTaskRepository;
// };

export const createWithInMemoryUnitOfWork = (): WithUow => {
  const uow = { taskRepository: createInMemoryTaskRepositiory() };
  return (cb) => cb(uow);
};

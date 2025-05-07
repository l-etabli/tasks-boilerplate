import { createWithInMemoryUnitOfWork } from "./adapters/withInMemoryUow.js";
import { addTask, listMyTasks } from "./domain/useCases.js";

export * from "./domain/entities.js";

export const bootstrapUseCases = (config: { uowKind: "in-memory" }) => {
  if (config.uowKind !== "in-memory") throw new Error(`Unsupported Uow kind : ${config.uowKind}`);

  const uowSetup = {
    withUow: createWithInMemoryUnitOfWork(),
  };

  return {
    listMyTasks: listMyTasks(uowSetup),
    addTask: addTask(uowSetup),
  };
};

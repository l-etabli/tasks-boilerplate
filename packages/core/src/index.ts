import { withInMemoryUnitOfWork } from "./adapters/withInMemoryUow.js";
import { addTask, listMyTasks } from "./domain/useCases.js";

export const instanciateUseCases = (config: { uowKind: "in-memory" }) => {
  if (config.uowKind !== "in-memory") throw new Error(`Unsupported Uow kind : ${config.uowKind}`);

  const uowSetup = {
    withUow: withInMemoryUnitOfWork,
  };

  return {
    listMyTasks: listMyTasks(uowSetup),
    addTask: addTask(uowSetup),
  };
};

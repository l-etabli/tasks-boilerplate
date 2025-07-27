import type { Kysely } from "kysely";
import type { Db } from "./adapters/pg/database.js";
import { createWithPgUnitOfWork } from "./adapters/pg/withPgUow.js";
import { createWithInMemoryUnitOfWork } from "./adapters/withInMemoryUow.js";
import { addTask, deleteTask, listMyTasks, updateUserPreferences } from "./domain/useCases.js";

export * from "./domain/entities.js";

type UowConfig = { kind: "inMemory" } | { kind: "pg"; db: Kysely<Db> };

export const bootstrapUseCases = (config: UowConfig) => {
  const uowSetup = {
    withUow: (() => {
      switch (config.kind) {
        case "inMemory":
          return createWithInMemoryUnitOfWork();
        case "pg":
          return createWithPgUnitOfWork(config.db);
        default: {
          config satisfies never;
          throw new Error(`Unsupported uow config : ${JSON.stringify(config)}`);
        }
      }
    })(),
  };

  return {
    listMyTasks: listMyTasks(uowSetup),
    addTask: addTask(uowSetup),
    deleteTask: deleteTask(uowSetup),
    updateUserPreferences: updateUserPreferences(uowSetup),
  };
};

import type { Kysely } from "kysely";
import { createInMemoryTaskQueries } from "./adapters/inMemory/taskQueries.js";
import { createInMemoryUserQueries } from "./adapters/inMemory/userQueries.js";
import { createWithInMemoryUnitOfWork } from "./adapters/inMemory/withInMemoryUow.js";
import type { Db } from "./adapters/pg/database.js";
import { createPgTaskQueries } from "./adapters/pg/taskQueries.js";
import { createPgUserQueries } from "./adapters/pg/userQueries.js";
import { createWithPgUnitOfWork } from "./adapters/pg/withPgUow.js";
import { addTask } from "./domain/use-cases/addTask.js";
import { deleteTask } from "./domain/use-cases/deleteTask.js";
import { updateUserPreferences } from "./domain/use-cases/updateUserPreferences.js";

export * from "./domain/entities/task.js";
export * from "./domain/entities/user-and-organization.js";
export * from "./domain/ports/UserQueries.js";

type UowConfig = { kind: "inMemory" } | { kind: "pg"; db: Kysely<Db> };

const getAdapters = (config: UowConfig) => {
  switch (config.kind) {
    case "inMemory": {
      const taskById: Record<string, any> = {};
      const organizationsById: Record<string, any> = {};
      return {
        withUow: createWithInMemoryUnitOfWork(),
        queries: {
          task: createInMemoryTaskQueries(taskById),
          user: createInMemoryUserQueries(organizationsById),
        },
      };
    }

    case "pg": {
      return {
        withUow: createWithPgUnitOfWork(config.db),
        queries: {
          task: createPgTaskQueries(config.db),
          user: createPgUserQueries(config.db),
        },
      };
    }

    default: {
      config satisfies never;
      throw new Error(`Unsupported config: ${JSON.stringify(config)}`);
    }
  }
};

export const bootstrapUseCases = (config: UowConfig) => {
  const { withUow, queries } = getAdapters(config);

  return {
    queries,
    mutations: {
      addTask: addTask({ withUow }),
      deleteTask: deleteTask({ withUow }),
      updateUserPreferences: updateUserPreferences({ withUow }),
    },
  };
};

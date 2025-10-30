import type { Kysely } from "kysely";
import {
  createInMemoryTaskQueries,
  createInMemoryUserQueries,
} from "./adapters/inMemoryQueries.js";
import type { Db } from "./adapters/pg/database.js";
import { createPgTaskQueries, createPgUserQueries } from "./adapters/pg/queries.js";
import { createWithPgUnitOfWork } from "./adapters/pg/withPgUow.js";
import { createWithInMemoryUnitOfWork } from "./adapters/withInMemoryUow.js";
import { addTask, deleteTask, updateUserPreferences } from "./domain/useCases.js";

export * from "./domain/entities.js";

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

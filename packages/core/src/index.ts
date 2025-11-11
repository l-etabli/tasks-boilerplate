import type { Kysely } from "kysely";
import { Resend } from "resend";
import { createInMemoryEmailGateway } from "./adapters/email/InMemoryEmailGateway.js";
import { createResendEmailGateway } from "./adapters/email/ResendEmailGateway.js";
import { createInMemoryTaskQueries } from "./adapters/inMemory/taskQueries.js";
import { createInMemoryUserQueries } from "./adapters/inMemory/userQueries.js";
import { createWithInMemoryUnitOfWork } from "./adapters/inMemory/withInMemoryUow.js";
import type { Db } from "./adapters/pg/database.js";
import { createPgTaskQueries } from "./adapters/pg/taskQueries.js";
import { createPgUserQueries } from "./adapters/pg/userQueries.js";
import { createWithPgUnitOfWork } from "./adapters/pg/withPgUow.js";
import { addTaskUseCase } from "./domain/use-cases/addTask.js";
import { deleteOrganizationUseCase } from "./domain/use-cases/deleteOrganization.js";
import { deleteTaskUseCase } from "./domain/use-cases/deleteTask.js";
import { updateOrganizationUseCase } from "./domain/use-cases/updateOrganization.js";
import { updateUserPreferencesUseCase } from "./domain/use-cases/updateUserPreferences.js";

export * from "./domain/entities/task.js";
export * from "./domain/entities/user-and-organization.js";
export * from "./domain/ports/UserQueries.js";

export type DbAdaptersConfig = { kind: "inMemory" } | { kind: "pg"; db: Kysely<Db> };

export type GatewaysConfig =
  | {
      kind: "inMemory";
      defaultEmailFrom: string;
    }
  | {
      kind: "resend";
      resendApiKey: string;
      defaultEmailFrom: string;
    };

const getDbAdapters = (config: DbAdaptersConfig) => {
  switch (config.kind) {
    case "inMemory": {
      const { withUow, helpers } = createWithInMemoryUnitOfWork();
      return {
        withUow,
        queries: {
          task: createInMemoryTaskQueries(helpers.task),
          user: createInMemoryUserQueries(helpers.user),
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
      throw new Error(`Unsupported DB config: ${JSON.stringify(config)}`);
    }
  }
};

const getGateways = (config: GatewaysConfig) => {
  switch (config.kind) {
    case "inMemory": {
      return {
        email: createInMemoryEmailGateway(config.defaultEmailFrom),
      };
    }

    case "resend": {
      return {
        email: createResendEmailGateway(new Resend(config.resendApiKey), config.defaultEmailFrom),
      };
    }

    default: {
      config satisfies never;
      throw new Error(`Unsupported Gateways config: ${JSON.stringify(config)}`);
    }
  }
};

export const bootstrapUseCases = ({
  dbConfig,
  gatewaysConfig,
}: {
  dbConfig: DbAdaptersConfig;
  gatewaysConfig: GatewaysConfig;
}) => {
  const { withUow, queries } = getDbAdapters(dbConfig);
  const gateways = getGateways(gatewaysConfig);

  return {
    queries,
    mutations: {
      addTask: addTaskUseCase({ withUow }),
      deleteTask: deleteTaskUseCase({ withUow }),
      updateUserPreferences: updateUserPreferencesUseCase({ withUow }),
      updateOrganization: updateOrganizationUseCase({ withUow }),
      deleteOrganization: deleteOrganizationUseCase({ withUow }),
    },
    gateways,
  };
};

import type { Kysely } from "kysely";
import type { User } from "../../../domain/user/entities/user-and-organization.js";
import type { Db } from "../database.js";
import { setupIntegrationTests } from "./integrationTestSetup.js";

type GlobalState = {
  mainDb: Kysely<Db>;
  getTestDb: () => Promise<Kysely<Db>>;
  rollbackTestDb: () => Promise<void>;
  defaultUser: User;
  cleanup: () => Promise<void>;
};

let globalState: GlobalState | null = null;

export async function initializeGlobalSetup(): Promise<GlobalState> {
  if (globalState) {
    return globalState;
  }

  const integrationSetup = await setupIntegrationTests();

  const defaultUser: User = {
    id: "test-default-user",
    email: "default@test.com",
    name: "Default Test User",
    preferences: null,
  };

  globalState = {
    mainDb: integrationSetup.mainDb,
    getTestDb: integrationSetup.getTestDb,
    rollbackTestDb: integrationSetup.rollbackTestDb,
    defaultUser,
    cleanup: integrationSetup.cleanup,
  };

  return globalState;
}

export function getGlobalState(): GlobalState {
  if (!globalState) {
    throw new Error("Global setup not initialized. Call initializeGlobalSetup() first.");
  }
  return globalState;
}

import type { Kysely } from "kysely";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import type { Db } from "../database.js";
import { getGlobalState, initializeGlobalSetup } from "./globalSetup.js";

let currentDb: Kysely<Db> | null = null;

export function setupPgIntegrationTest() {
  beforeAll(async () => {
    await initializeGlobalSetup();
  });

  afterAll(async () => {
    const state = getGlobalState();
    await state.cleanup();
  });

  beforeEach(async () => {
    const state = getGlobalState();
    currentDb = await state.getTestDb();
  });

  afterEach(async () => {
    const state = getGlobalState();
    await state.rollbackTestDb();
    currentDb = null;
  });

  return {
    getDb: () => {
      if (!currentDb) {
        throw new Error("Database not initialized. Make sure test is running inside beforeEach.");
      }
      return currentDb;
    },
    getDefaultUser: () => {
      const state = getGlobalState();
      return state.defaultUser;
    },
  };
}

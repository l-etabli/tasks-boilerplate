import type { Db } from "@tasks/db";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

let mainDb: Kysely<Db> | null = null;
let currentTransaction: Kysely<Db> | null = null;

async function createDbConnection(connectionUri: string): Promise<Kysely<Db>> {
  const pool = new Pool({
    connectionString: connectionUri,
  });

  return new Kysely<Db>({
    dialect: new PostgresDialect({ pool }),
  });
}

export async function setupIntegrationTests() {
  const connectionUri = process.env.TEST_DATABASE_URL;

  if (!connectionUri) {
    throw new Error(
      "TEST_DATABASE_URL not set. Make sure globalSetup is configured in vitest.config.ts",
    );
  }

  mainDb = await createDbConnection(connectionUri);

  return {
    mainDb: mainDb!,
    getTestDb: async (): Promise<Kysely<Db>> => {
      await sql`BEGIN`.execute(mainDb!);
      currentTransaction = mainDb!;
      return mainDb!;
    },
    rollbackTestDb: async () => {
      if (currentTransaction) {
        await sql`ROLLBACK`.execute(currentTransaction);
        currentTransaction = null;
      }
    },
    cleanup: async () => {
      if (currentTransaction) {
        await sql`ROLLBACK`.execute(currentTransaction);
        currentTransaction = null;
      }

      if (mainDb) {
        await mainDb.destroy();
        mainDb = null;
      }
    },
  };
}

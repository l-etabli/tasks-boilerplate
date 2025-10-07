import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Db } from "./db-schema/database.js";
import { createSentryInstrumentedPool, type SentryInterface } from "./postgres-instrumentation.js";

let pgPool: Pool | null = null;
let db: Kysely<Db> | null = null;

export const createPgPool = (sentry?: SentryInterface) => {
  if (!pgPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    pgPool = sentry ? createSentryInstrumentedPool(pool, sentry) : pool;
  }
  return pgPool;
};

export const getKyselyDb = (sentry?: SentryInterface) => {
  if (!db) {
    const dialect = new PostgresDialect({
      pool: createPgPool(sentry),
    });
    db = new Kysely<Db>({
      dialect,
    });
  }

  return db;
};

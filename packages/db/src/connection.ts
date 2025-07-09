import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Db } from "./db-schema/database.js";

let pgPool: Pool | null = null;
let db: Kysely<Db> | null = null;

export const createPgPool = () => {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pgPool;
};

export const getKyselyDb = () => {
  if (!db) {
    const dialect = new PostgresDialect({
      pool: createPgPool(),
    });
    db = new Kysely<Db>({
      dialect,
    });
  }

  return db;
};

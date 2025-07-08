import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Db } from "./database.js";

let _pgPool: Pool | null = null;
let _db: Kysely<Db> | null = null;

export const pgPool = () => {
  if (!_pgPool) {
    _pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return _pgPool;
};

export const db = () => {
  if (!_db) {
    const dialect = new PostgresDialect({
      pool: pgPool(),
    });
    _db = new Kysely<Db>({
      dialect,
    });
  }
  return _db;
};

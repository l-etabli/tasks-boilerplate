import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const dialect = new PostgresDialect({
  pool: pgPool,
});

export const db = new Kysely<any>({
  dialect,
});

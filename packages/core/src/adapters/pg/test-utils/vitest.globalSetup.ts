import { runMigrations } from "@tasks/db";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Db } from "../database.js";

let container: StartedPostgreSqlContainer | null = null;

export async function setup() {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const connectionUri = container.getConnectionUri();

  const pool = new Pool({ connectionString: connectionUri });
  const db = new Kysely<Db>({ dialect: new PostgresDialect({ pool }) });

  await runMigrations(db);

  // Create default user
  await db
    .insertInto("user")
    .values({
      id: "test-default-user",
      email: "default@test.com",
      name: "Default Test User",
      emailVerified: false,
      preferences: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .execute();

  await db.destroy();

  process.env.TEST_DATABASE_URL = connectionUri;
}

export async function teardown() {
  if (container) {
    await container.stop();
    container = null;
  }
}

#!/usr/bin/env node

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { FileMigrationProvider, Migrator } from "kysely";
import { getKyselyDb } from "./connection.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export async function runMigrations() {
  console.info("Starting database migrations...");

  const db = getKyselyDb();

  try {
    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, "./migrations"),
      }),
    });

    const { error, results } = await migrator.migrateToLatest();

    for (const it of results ?? []) {
      if (it.status === "Success") {
        console.info(`✅ Migration "${it.migrationName}" was executed successfully`);
      } else if (it.status === "Error") {
        console.error(`❌ Failed to execute migration "${it.migrationName}"`);
      }
    }

    if (error) {
      console.error("Failed to migrate");
      console.error(error);
      process.exit(1);
    }

    console.info("All migrations completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

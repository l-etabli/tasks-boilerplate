import { Migrator } from "kysely";
import type { Kysely } from "kysely";
import type { Db } from "../src/db-schema/database.js";
import { migrations } from "../src/migrations/index.js";

export async function runMigrations(db: Kysely<Db>): Promise<void> {
	const migrator = new Migrator({
		db,
		provider: {
			async getMigrations() {
				return migrations;
			},
		},
	});

	const { error, results } = await migrator.migrateToLatest();

	if (error) {
		console.error("Migration error:", error);
		throw error;
	}

	if (results) {
		for (const result of results) {
			if (result.status === "Success") {
				console.info(`✅ Migration "${result.migrationName}" executed successfully`);
			} else if (result.status === "Error") {
				console.error(`❌ Migration "${result.migrationName}" failed`);
				throw new Error(`Failed to run migration ${result.migrationName}`);
			} else {
				console.log(`- Migration "${result.migrationName}" was already executed`);
			}
		}
	}

	console.log("All migrations completed successfully");
}

#!/usr/bin/env tsx
import { readdir } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkMigrationsIndex() {
	const migrationsDir = path.resolve(__dirname, "../src/migrations");

	// Read all migration files
	const files = await readdir(migrationsDir);
	const migrationFiles = files
		.filter((file) => file.endsWith(".ts") && file !== "index.ts")
		.map((file) => file.replace(".ts", ""))
		.sort();

	if (migrationFiles.length === 0) {
		console.log("⚠️  No migration files found");
		return;
	}

	// Import the migrations index
	const { migrations } = await import("../src/migrations/index.js");
	const indexedMigrations = Object.keys(migrations).sort();

	// Check for missing migrations
	const missing = migrationFiles.filter((file) => !indexedMigrations.includes(file));

	// Check for extra migrations in index
	const extra = indexedMigrations.filter((file) => !migrationFiles.includes(file));

	let hasErrors = false;

	if (missing.length > 0) {
		console.error("❌ Missing migrations in index.ts:");
		for (const file of missing) {
			console.error(`   - ${file}.ts`);
		}
		hasErrors = true;
	}

	if (extra.length > 0) {
		console.error("❌ Extra migrations in index.ts (files don't exist):");
		for (const file of extra) {
			console.error(`   - ${file}.ts`);
		}
		hasErrors = true;
	}

	if (hasErrors) {
		console.error("\n💡 Run 'pnpm db:generate-index' to fix this");
		process.exit(1);
	}

	console.log("✅ All", migrationFiles.length, "migrations are correctly indexed");
}

checkMigrationsIndex().catch((error) => {
	console.error("❌ Failed to check migrations index:", error);
	process.exit(1);
});

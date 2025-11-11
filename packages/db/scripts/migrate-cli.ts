#!/usr/bin/env node
import { getKyselyDb } from "../src/connection.js";
import { runMigrations } from "./migrate.js";

async function main() {
	console.log("Starting database migrations...");

	const db = getKyselyDb();

	try {
		await runMigrations(db);
		await db.destroy();
		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		await db.destroy();
		process.exit(1);
	}
}

main();

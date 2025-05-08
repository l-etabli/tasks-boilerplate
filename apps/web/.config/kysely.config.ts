import { defineConfig } from 'kysely-ctl'
import { db } from "../src/utils/database.js";

export default defineConfig({
	kysely: db,
	migrations: {
		migrationFolder: ".config/migrations",
	}
});

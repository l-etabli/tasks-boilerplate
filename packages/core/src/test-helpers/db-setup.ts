import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Db } from "@tasks/db";

let testDb: Kysely<Db> | null = null;
let testPool: Pool | null = null;

/**
 * Get a test database connection
 * Requires DATABASE_URL environment variable to be set
 */
export const getTestDb = () => {
	if (!testDb) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error(
				"DATABASE_URL environment variable is required for integration tests",
			);
		}

		testPool = new Pool({ connectionString });
		const dialect = new PostgresDialect({ pool: testPool });
		testDb = new Kysely<Db>({ dialect });
	}

	return testDb;
};

/**
 * Clean up database connection after all tests
 */
export const closeTestDb = async () => {
	if (testDb) {
		await testDb.destroy();
		testDb = null;
	}
	if (testPool) {
		await testPool.end();
		testPool = null;
	}
};

/**
 * Clean up test data from tables
 */
export const cleanupTestData = async (db: Kysely<Db>) => {
	await db.deleteFrom("tasks").execute();
};

/**
 * Create a test user for testing purposes
 */
export const createTestUser = async (
	db: Kysely<Db>,
	userData: { id: string; email: string; name?: string | null },
) => {
	await db
		.insertInto("user")
		.values({
			id: userData.id,
			email: userData.email,
			name: userData.name ?? null,
			emailVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			preferences: null,
		})
		.onConflict((oc) => oc.column("id").doNothing())
		.execute();
};

/**
 * Remove test user
 */
export const removeTestUser = async (db: Kysely<Db>, userId: string) => {
	await db.deleteFrom("user").where("id", "=", userId).execute();
};

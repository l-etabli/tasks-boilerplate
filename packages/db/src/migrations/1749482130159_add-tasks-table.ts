import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tasks")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("description", "text", (c) => c.notNull())
    .addColumn("ownerId", "text", (c) => c.references("user.id").notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("tasks").execute();
}

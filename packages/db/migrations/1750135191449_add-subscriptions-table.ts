import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType("user_plan").asEnum(["pro"]).execute();

  await db.schema
    .createTable("subscriptions")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("userId", "text", (col) => col.notNull().references("user.id"))
    .addColumn("plan", sql`user_plan`, (col) => col.notNull())
    .addColumn("isTrial", "boolean", (col) => col.notNull())
    .addColumn("subscribedAt", "timestamptz", (col) => col.notNull())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("canceledAt", "timestamptz")
    .execute();

  await db.schema
    .alterTable("user")
    .addColumn("activePlan", sql`user_plan`, (col) => col)
    .addColumn("activeSubscriptionId", "uuid", (col) => col.references("subscriptions.id"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("subscriptions").execute();
  await db.schema.dropType("user_plan").execute();
} 
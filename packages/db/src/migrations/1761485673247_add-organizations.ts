import type { Kysely } from "kysely";
import { sql } from "kysely";

// Better Auth organization plugin tables
// Reference: https://www.better-auth.com/docs/plugins/organization

export async function up(db: Kysely<any>): Promise<void> {
  // Organization table
  await db.schema
    .createTable("organization")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.unique())
    .addColumn("logo", "text")
    .addColumn("metadata", "text")
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Member table (links users to organizations with roles)
  await db.schema
    .createTable("member")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("organizationId", "text", (col) =>
      col.notNull().references("organization.id").onDelete("cascade"),
    )
    .addColumn("userId", "text", (col) => col.notNull().references("user.id").onDelete("cascade"))
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Invitation table
  await db.schema
    .createTable("invitation")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("organizationId", "text", (col) =>
      col.notNull().references("organization.id").onDelete("cascade"),
    )
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("role", "text")
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("inviterId", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .execute();

  // Add activeOrganizationId to session table
  await db.schema
    .alterTable("session")
    .addColumn("activeOrganizationId", "text", (col) =>
      col.references("organization.id").onDelete("set null"),
    )
    .execute();

  // Create indexes for performance
  await db.schema
    .createIndex("member_organization_id_idx")
    .on("member")
    .column("organizationId")
    .execute();

  await db.schema.createIndex("member_user_id_idx").on("member").column("userId").execute();

  await db.schema
    .createIndex("invitation_organization_id_idx")
    .on("invitation")
    .column("organizationId")
    .execute();

  await db.schema.createIndex("invitation_email_idx").on("invitation").column("email").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex("invitation_email_idx").ifExists().execute();
  await db.schema.dropIndex("invitation_organization_id_idx").ifExists().execute();
  await db.schema.dropIndex("member_user_id_idx").ifExists().execute();
  await db.schema.dropIndex("member_organization_id_idx").ifExists().execute();

  // Remove activeOrganizationId from session
  await db.schema.alterTable("session").dropColumn("activeOrganizationId").execute();

  // Drop tables (order matters due to foreign keys)
  await db.schema.dropTable("invitation").ifExists().execute();
  await db.schema.dropTable("member").ifExists().execute();
  await db.schema.dropTable("organization").ifExists().execute();
}

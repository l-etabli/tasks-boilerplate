import type { Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { UserQueries } from "../../domain/ports/userQueries.js";
import type { Db } from "./database.js";

export const createPgUserQueries = (db: Kysely<Db>): UserQueries => ({
  getCurrentUserOrganizations: async (userId) => {
    const organizations = await db
      .selectFrom("organization")
      .innerJoin("member as currentUserMember", (join) =>
        join
          .onRef("currentUserMember.organizationId", "=", "organization.id")
          .on("currentUserMember.userId", "=", userId),
      )
      .select((eb) => [
        "organization.id",
        "organization.name",
        "organization.slug",
        "organization.logo",
        "organization.metadata",
        "organization.createdAt",
        "currentUserMember.role as role",
        jsonArrayFrom(
          eb
            .selectFrom("member")
            .whereRef("member.organizationId", "=", "organization.id")
            .select(["member.id", "member.userId", "member.role", "member.createdAt"]),
        ).as("members"),
      ])
      .execute();

    return organizations.map((org) => ({
      ...org,
      createdAt: new Date(org.createdAt),
      members: org.members.map((member) => ({
        ...member,
        createdAt: new Date(member.createdAt),
      })),
    }));
  },
});

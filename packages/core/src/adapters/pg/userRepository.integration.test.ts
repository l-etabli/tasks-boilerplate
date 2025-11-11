import { randomUUID } from "node:crypto";
import { expectToEqual } from "@tasks/test";
import type { Kysely } from "kysely";
import { beforeEach, describe, it } from "vitest";
import { userFactory } from "../../domain/entities/userFactory.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import type { Db } from "./database.js";
import { setupPgIntegrationTest } from "./test-utils/integrationTestHelpers.js";
import { createPgUserRepository } from "./userRepository.js";

describe("userRepository (PostgreSQL)", () => {
  const { getDb } = setupPgIntegrationTest();
  let db: Kysely<Db>;
  let userRepository: UserRepository;

  beforeEach(() => {
    db = getDb();
    userRepository = createPgUserRepository(db);
  });

  describe("getUserOrganizations", () => {
    it("should return organizations for a user with members", async () => {
      const user1 = userFactory({ id: "user-1", email: "user1@test.com", name: "User 1" });
      const user2 = userFactory({ id: "user-2", email: "user2@test.com", name: "User 2" });

      await db
        .insertInto("user")
        .values([
          {
            id: user1.id,
            email: user1.email,
            name: user1.name!,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: user2.id,
            email: user2.email,
            name: user2.name!,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
        .execute();

      const orgId = "org-1";
      await db
        .insertInto("organization")
        .values({
          id: orgId,
          name: "Test Organization",
          slug: "test-org",
          logo: null,
          metadata: null,
          createdAt: new Date(),
        })
        .execute();

      await db
        .insertInto("member")
        .values([
          {
            id: "member-1",
            organizationId: orgId,
            userId: user1.id,
            role: "owner",
            createdAt: new Date(),
          },
          {
            id: "member-2",
            organizationId: orgId,
            userId: user2.id,
            role: "member",
            createdAt: new Date(),
          },
        ])
        .execute();

      const organizations = await userRepository.getUserOrganizations(user1.id);

      expectToEqual(organizations.length, 1);
      const org = organizations[0]!;
      expectToEqual(org.id, orgId);
      expectToEqual(org.name, "Test Organization");
      expectToEqual((org as any).role, "owner");
      expectToEqual(org.members.length, 2);
      expectToEqual(org.members[0]!.userId, user1.id);
      expectToEqual(org.members[0]!.role, "owner");
      expectToEqual(org.members[1]!.userId, user2.id);
      expectToEqual(org.members[1]!.role, "member");
    });

    it("should return empty array for user with no organizations", async () => {
      const userId = `test-user-${randomUUID()}`;
      const user = userFactory({ id: userId, name: "Test User" });

      await db
        .insertInto("user")
        .values({
          id: user.id,
          email: user.email,
          name: user.name!,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      const organizations = await userRepository.getUserOrganizations(user.id);

      expectToEqual(organizations.length, 0);
    });

    it("should include pending invitations", async () => {
      const ownerId = `test-owner-${randomUUID()}`;
      const inviterId = `test-inviter-${randomUUID()}`;
      const orgId = `test-org-${randomUUID()}`;
      const memberId = `test-member-${randomUUID()}`;
      const invitationId = `test-invitation-${randomUUID()}`;

      const owner = userFactory({ id: ownerId, name: "Owner" });
      const inviter = userFactory({ id: inviterId, name: "Inviter" });

      await db
        .insertInto("user")
        .values([
          {
            id: owner.id,
            email: owner.email,
            name: owner.name!,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: inviter.id,
            email: inviter.email,
            name: inviter.name!,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
        .execute();

      await db
        .insertInto("organization")
        .values({
          id: orgId,
          name: "Test Organization",
          slug: `test-org-slug-${randomUUID()}`,
          logo: null,
          metadata: null,
          createdAt: new Date(),
        })
        .execute();

      await db
        .insertInto("member")
        .values({
          id: memberId,
          organizationId: orgId,
          userId: owner.id,
          role: "owner",
          createdAt: new Date(),
        })
        .execute();

      const invitation = {
        id: invitationId,
        email: "invited@test.com",
        role: "member" as const,
      };
      await db
        .insertInto("invitation")
        .values({
          id: invitation.id,
          organizationId: orgId,
          email: invitation.email,
          role: invitation.role,
          status: "pending",
          inviterId: inviter.id,
          expiresAt: new Date(Date.now() + 86400000),
        })
        .execute();

      const organizations = await userRepository.getUserOrganizations(owner.id);

      expectToEqual(organizations.length, 1);
      const org = organizations[0]!;
      expectToEqual(
        org.invitations.map(({ id, email, role, inviterName }) => ({
          id,
          email,
          role,
          inviterName,
        })),
        [{ ...invitation, inviterName: inviter.name }],
      );
    });
  });

  describe("updatePreferences", () => {
    it("should merge preferences with existing null preferences", async () => {
      const userId = `test-user-${randomUUID()}`;
      const user = userFactory({ id: userId, name: "Test User" });

      await db
        .insertInto("user")
        .values({
          id: user.id,
          email: user.email,
          name: user.name!,
          emailVerified: false,
          preferences: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      const result = await userRepository.updatePreferences(user.id, {
        theme: "dark",
        locale: "en",
      });

      expectToEqual(result.id, user.id);
      expectToEqual(result.preferences, { theme: "dark", locale: "en" });
    });

    it("should merge preferences with existing preferences", async () => {
      const userId = `test-user-${randomUUID()}`;
      const user = userFactory({ id: userId, name: "Test User" });

      await db
        .insertInto("user")
        .values({
          id: user.id,
          email: user.email,
          name: user.name!,
          emailVerified: false,
          preferences: { theme: "light", locale: "fr" },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      const result = await userRepository.updatePreferences(user.id, {
        theme: "dark",
      });

      expectToEqual(result.preferences, {
        theme: "dark",
        locale: "fr",
      });
    });

    it("should replace entire preferences object", async () => {
      const userId = `test-user-${randomUUID()}`;
      const user = userFactory({ id: userId, name: "Test User" });

      await db
        .insertInto("user")
        .values({
          id: user.id,
          email: user.email,
          name: user.name!,
          emailVerified: false,
          preferences: { theme: "light" },
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      const result = await userRepository.updatePreferences(user.id, {
        locale: "en",
      });

      expectToEqual(result.preferences, {
        theme: "light",
        locale: "en",
      });
    });
  });
});

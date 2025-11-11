import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, it } from "vitest";
import { expectPromiseToFailWith } from "../../../../test/src/testUtils.js";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../adapters/inMemory/withInMemoryUow.js";
import { memberFactory, organizationFactory } from "../entities/organizationFactory.js";
import { userFactory } from "../entities/userFactory.js";
import { deleteOrganizationUseCase } from "./deleteOrganization.js";

describe("deleteOrganization", () => {
  let deleteOrganization: ReturnType<typeof deleteOrganizationUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    deleteOrganization = deleteOrganizationUseCase({
      withUow: uowConfig.withUow,
    });
  });

  it("should allow owner to delete organization", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await deleteOrganization({
      input: { organizationId: org.id },
      currentUser,
    });

    expectToEqual(helpers.user.organizationsById[org.id], undefined);
  });

  it("should throw error when organization not found", async () => {
    await expectPromiseToFailWith(
      deleteOrganization({
        input: { organizationId: "non-existent" },
        currentUser,
      }),
      "Organization not found",
    );
  });

  it("should throw error when user is not a member of the organization", async () => {
    const otherUser = userFactory({ id: "other-user" });
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: otherUser, role: "owner" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await expectPromiseToFailWith(
      deleteOrganization({
        input: { organizationId: org.id },
        currentUser,
      }),
      "Organization not found",
    );
  });

  it("should throw error when user is a member but not owner", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "member" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await expectPromiseToFailWith(
      deleteOrganization({
        input: { organizationId: org.id },
        currentUser,
      }),
      "Only organization owners can delete the organization",
    );
  });

  it("should throw error when user is an admin but not owner", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "admin" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await expectPromiseToFailWith(
      deleteOrganization({
        input: { organizationId: org.id },
        currentUser,
      }),
      "Only organization owners can delete the organization",
    );
  });
});

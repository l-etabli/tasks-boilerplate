import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, it } from "vitest";
import { expectPromiseToFailWith } from "../../../../test/src/testUtils.js";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../adapters/inMemory/withInMemoryUow.js";
import { memberFactory, organizationFactory } from "../entities/organizationFactory.js";
import { userFactory } from "../entities/userFactory.js";
import { updateOrganizationUseCase } from "./updateOrganization.js";

describe("updateOrganization", () => {
  let updateOrganization: ReturnType<typeof updateOrganizationUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    updateOrganization = updateOrganizationUseCase({
      withUow: uowConfig.withUow,
    });
  });

  it("should allow owner to update organization name", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await updateOrganization({
      input: { organizationId: org.id, name: "New Organization Name" },
      currentUser,
    });

    expectToEqual(helpers.user.organizationsById[org.id]?.name, "New Organization Name");
  });

  it("should allow owner to update organization logo", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await updateOrganization({
      input: { organizationId: org.id, logo: "https://example.com/logo.png" },
      currentUser,
    });

    expectToEqual(helpers.user.organizationsById[org.id]?.logo, "https://example.com/logo.png");
  });

  it("should allow owner to update organization metadata", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await updateOrganization({
      input: { organizationId: org.id, metadata: '{"key": "value"}' },
      currentUser,
    });

    expectToEqual(helpers.user.organizationsById[org.id]?.metadata, '{"key": "value"}');
  });

  it("should allow owner to update multiple fields at once", async () => {
    const org = organizationFactory({
      id: "org-1",
      name: "Old Name",
      logo: null,
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await updateOrganization({
      input: {
        organizationId: org.id,
        name: "New Name",
        logo: "https://example.com/new-logo.png",
        metadata: '{"updated": true}',
      },
      currentUser,
    });

    const updatedOrg = helpers.user.organizationsById[org.id];
    expectToEqual(updatedOrg?.name, "New Name");
    expectToEqual(updatedOrg?.logo, "https://example.com/new-logo.png");
    expectToEqual(updatedOrg?.metadata, '{"updated": true}');
  });

  it("should throw error when organization not found", async () => {
    await expectPromiseToFailWith(
      updateOrganization({
        input: { organizationId: "non-existent", name: "New Name" },
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
      updateOrganization({
        input: { organizationId: org.id, name: "New Name" },
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
      updateOrganization({
        input: { organizationId: org.id, name: "New Name" },
        currentUser,
      }),
      "Only organization owners can update the organization",
    );
  });

  it("should throw error when user is an admin but not owner", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "admin" })],
    });
    helpers.user.organizationsById[org.id] = org;

    await expectPromiseToFailWith(
      updateOrganization({
        input: { organizationId: org.id, name: "New Name" },
        currentUser,
      }),
      "Only organization owners can update the organization",
    );
  });
});

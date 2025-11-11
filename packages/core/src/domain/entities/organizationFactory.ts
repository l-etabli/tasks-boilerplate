import type { Organization, OrganizationMember, User } from "./user-and-organization.js";

let orgIdCounter = 1;
let memberIdCounter = 1;

type OrganizationMemberFactoryOptions = Partial<OrganizationMember> & {
  user?: User;
};

/**
 * Test-only factory for creating Organization objects with sensible defaults.
 * DO NOT use in production code - only for tests.
 *
 * @example
 * const org = organizationFactory();
 * const orgWithOwner = organizationFactory({
 *   members: [memberFactory({ role: "owner", userId: "user-1" })]
 * });
 */
export const organizationFactory = (overrides?: Partial<Organization>): Organization => {
  const id = overrides?.id ?? `org-${orgIdCounter++}`;

  const defaultOrganization: Organization = {
    id,
    name: `Test Organization ${id}`,
    slug: `test-org-${id}`,
    logo: null,
    metadata: null,
    createdAt: new Date(),
    members: [],
    invitations: [],
  };

  return { ...defaultOrganization, ...overrides };
};

/**
 * Test-only factory for creating OrganizationMember objects with sensible defaults.
 * DO NOT use in production code - only for tests.
 *
 * @example
 * const member = memberFactory();
 * const owner = memberFactory({ role: "owner", userId: "user-123" });
 * const ownerFromUser = memberFactory({ user: currentUser, role: "owner" });
 */
export const memberFactory = (options?: OrganizationMemberFactoryOptions): OrganizationMember => {
  const { user, ...overrides } = options ?? {};

  const id = overrides?.id ?? `member-${memberIdCounter++}`;
  const userId = overrides?.userId ?? user?.id ?? `user-${memberIdCounter}`;

  const defaultMember: OrganizationMember = {
    id,
    userId,
    role: overrides?.role ?? "member",
    createdAt: overrides?.createdAt ?? new Date(),
    name: overrides?.name ?? user?.name ?? `Test Member ${id}`,
    email: overrides?.email ?? user?.email ?? `${userId}@example.com`,
  };

  return defaultMember;
};

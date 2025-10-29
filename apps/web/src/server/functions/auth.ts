import { createServerFn, type ServerFn, type ServerFnCtx } from "@tanstack/react-start";
import type { User } from "@tasks/core";

type AnyServerFnCtx = ServerFnCtx<any, any, any, any>;

const getRequestHeaders = (ctx: AnyServerFnCtx): Request["headers"] => {
  const { request } = ctx as unknown as { request: Request };
  return request.headers;
};

const getCurrentUser = async (headers: Request["headers"]): Promise<User | null> => {
  const { auth } = await import("@/utils/auth");
  const session = await auth.api.getSession({ headers });

  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    activePlan: (session.user.activePlan as "pro" | null) || null,
    activeSubscriptionId: session.user.activeSubscriptionId || null,
    preferredLocale: (session.user.preferredLocale as "en" | "fr" | null) || null,
  };
};

export const authenticated = <
  TRegister,
  TMethod,
  TMiddlewares,
  TInputValidator,
  TResponse,
>(params: {
  name: string;
  handler: (
    params: ServerFnCtx<TRegister, TMethod, TMiddlewares, TInputValidator> & {
      currentUser: User;
    },
  ) => TResponse;
}) =>
  (async (ctx) => {
    const headers = getRequestHeaders(ctx);
    const currentUser = await getCurrentUser(headers);
    if (!currentUser) throw new Response("Unauthorized", { status: 401 });
    return params.handler({ ...ctx, currentUser });
  }) as ServerFn<TRegister, TMethod, TMiddlewares, TInputValidator, TResponse>;

export const getAuthContextFn = createServerFn({ method: "GET" }).handler(async (ctx: unknown) => {
  const { auth } = await import("@/utils/auth");
  const request = (ctx as { request: Request }).request;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return null;
  }

  const organizations = await auth.api.listOrganizations({
    headers: request.headers,
  });

  // Fetch member info for each organization to get role
  const organizationsWithRoles = await Promise.all(
    (organizations || []).map(async (org) => {
      try {
        // Get full organization details which includes member role
        const fullOrg = await auth.api.getFullOrganization({
          headers: request.headers,
          query: { organizationId: org.id },
        });

        // Find current user's membership to get their role
        const userMembership = fullOrg?.members?.find(
          (member: any) => member.userId === session.user.id,
        );

        return {
          ...org,
          role: userMembership?.role || null,
          members: fullOrg?.members || [],
        };
      } catch {
        return { ...org, role: null, members: [] };
      }
    }),
  );

  const user: User = {
    id: session.user.id,
    email: session.user.email,
    activePlan: (session.user.activePlan as "pro" | null) || null,
    activeSubscriptionId: session.user.activeSubscriptionId || null,
    preferredLocale: (session.user.preferredLocale as "en" | "fr" | null) || null,
  };

  let activeOrganizationId = session.session.activeOrganizationId || null;

  // Auto-select if no active org is set
  if (!activeOrganizationId && organizationsWithRoles.length > 0) {
    // Priority 1: Personal organization (metadata contains type: "personal")
    const personalOrg = organizationsWithRoles.find((org) => {
      try {
        const metadata = org.metadata ? JSON.parse(org.metadata) : {};
        return metadata.type === "personal";
      } catch {
        return false;
      }
    });

    // Priority 2: First organization
    const orgToActivate = personalOrg || organizationsWithRoles[0];

    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: { organizationId: orgToActivate.id },
    });

    activeOrganizationId = orgToActivate.id;
  }

  return {
    user,
    organizations: organizationsWithRoles,
    activeOrganizationId,
  };
});

import * as Sentry from "@sentry/tanstackstart-react";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import type { User } from "@tasks/core";
import { useCases } from "./bootstrap";

const getCurrentUserAndActiveOrganisationId = async (
  headers: Request["headers"],
): Promise<{ currentUser: User; activeOrganizationId: string | null } | null> => {
  return Sentry.startSpan(
    {
      op: "auth.session",
      name: "getCurrentUser",
    },
    async () => {
      const { auth } = await import("@/utils/auth");
      const session = await auth.api.getSession({ headers });

      if (!session?.user) return null;

      return {
        currentUser: {
          id: session.user.id,
          email: session.user.email,
          preferences: session.user.preferences ?? null,
        },
        activeOrganizationId: session.session.activeOrganizationId ?? null,
      };
    },
  );
};

export type AuthenticatedContext = {
  currentUser: User;
  activeOrganizationId: string | null;
};

export const authenticated = (params: { name: string }) =>
  createMiddleware().server(async ({ next, request }) =>
    Sentry.startSpan(
      {
        op: "useCase",
        name: `authenticated:${params.name}`,
      },
      async () => {
        const authenticated = await getCurrentUserAndActiveOrganisationId(request.headers);
        if (!authenticated) throw new Response("Unauthorized", { status: 401 });

        const { currentUser, activeOrganizationId } = authenticated;

        Sentry.setUser({ id: currentUser.id });

        return next({
          context: {
            currentUser,
            activeOrganizationId,
          },
        });
      },
    ),
  );

export const getAuthContextFn = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const { request } = ctx as unknown as { request: Request };
  const headers = request.headers;
  const authenticated = await getCurrentUserAndActiveOrganisationId(headers);

  // Read cookie preferences for all users (authenticated or not)
  const cookieHeader = headers.get("cookie");
  const { getPreferencesCookie } = await import("@/utils/preferences");
  const cookiePrefs = cookieHeader ? getPreferencesCookie(cookieHeader) : null;

  if (!authenticated) {
    // For non-authenticated users, return cookie preferences to prevent flash
    return {
      currentUser: null,
      organizations: [],
      activeOrganizationId: null,
      preferences: cookiePrefs,
    };
  }

  let { currentUser } = authenticated;

  // Merge cookie preferences with DB preferences (cookie takes priority)
  // This prevents flash when cookie has different value than session cache
  if (cookiePrefs) {
    currentUser = {
      ...currentUser,
      preferences: { ...currentUser.preferences, ...cookiePrefs },
    };
  }

  const organizations = await useCases.queries.user.getCurrentUserOrganizations(currentUser.id);

  const activeOrganizationId =
    authenticated.activeOrganizationId ??
    (organizations.length > 0 ? await getDefaultActiveOrganization(headers, organizations) : null);

  return {
    currentUser,
    organizations,
    activeOrganizationId,
    preferences: currentUser.preferences,
  };
});

const getDefaultActiveOrganization = async (
  headers: Request["headers"],
  organizationsWithRoles: { id: string; metadata?: any }[],
): Promise<string | null> => {
  if (organizationsWithRoles.length === 0) {
    return null;
  }

  const { auth } = await import("@/utils/auth");
  const personalOrg = organizationsWithRoles.find((org) => {
    try {
      const metadata = org.metadata ? JSON.parse(org.metadata) : {};
      return metadata.type === "personal";
    } catch {
      return false;
    }
  });

  // Priority 1: Personal organization, Priority 2: First organization
  const orgToActivate = personalOrg ?? organizationsWithRoles[0];

  await auth.api.setActiveOrganization({
    headers,
    body: { organizationId: orgToActivate.id },
  });

  return orgToActivate.id;
};

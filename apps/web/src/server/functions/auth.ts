import * as Sentry from "@sentry/tanstackstart-react";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import type { User } from "@tasks/core";
import { useCases } from "./bootstrap";

const getSession = async (
  headers: Request["headers"],
): Promise<Awaited<ReturnType<typeof import("@/utils/auth").auth.api.getSession>> | null> => {
  return Sentry.startSpan(
    {
      op: "auth.session",
      name: "getSession",
    },
    async () => {
      const { auth } = await import("@/utils/auth");
      const session = await auth.api.getSession({ headers });

      if (!session?.user) return null;

      return session;
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
        const session = await getSession(request.headers);
        if (!session) throw new Response("Unauthorized", { status: 401 });

        const currentUser: User = {
          id: session.user.id,
          email: session.user.email,
          preferences: session.user.preferences ?? null,
        };
        const activeOrganizationId = session.session.activeOrganizationId ?? null;

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

  const session = await getSession(headers);

  // Read cookie preferences for all users (authenticated or not)
  const cookieHeader = headers.get("cookie");
  const { getPreferencesCookie } = await import("@/utils/preferences");
  const cookiePrefs = cookieHeader ? getPreferencesCookie(cookieHeader) : null;

  if (!session) {
    // For non-authenticated users, return cookie preferences to prevent flash
    return {
      session: null,
      currentUser: null,
      organizations: [],
      activeOrganizationId: null,
      preferences: cookiePrefs,
    };
  }

  const currentUser: User = {
    id: session.user.id,
    email: session.user.email,
    preferences: session.user.preferences ?? null,
  };

  // Merge cookie preferences with DB preferences (cookie takes priority)
  // This prevents flash when cookie has different value than session cache
  let mergedPreferences = currentUser.preferences;
  if (cookiePrefs) {
    mergedPreferences = { ...currentUser.preferences, ...cookiePrefs };
  }

  const organizations = await useCases.queries.user.getCurrentUserOrganizations(currentUser.id);

  const activeOrganizationId =
    session.session.activeOrganizationId ??
    (organizations.length > 0 ? await getDefaultActiveOrganization(headers, organizations) : null);

  // Create a session object with updated preferences if we have cookie preferences
  const sessionWithUpdatedPrefs = cookiePrefs
    ? {
        ...session,
        user: {
          ...session.user,
          preferences: mergedPreferences,
        },
      }
    : session;

  return {
    session: sessionWithUpdatedPrefs as any,
    currentUser: {
      ...currentUser,
      preferences: mergedPreferences,
    },
    organizations,
    activeOrganizationId,
    preferences: mergedPreferences,
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

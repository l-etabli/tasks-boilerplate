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
          preferredLocale: (session.user.preferredLocale as "en" | "fr" | null) || null,
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
  if (!authenticated) return null;

  const { currentUser, activeOrganizationId } = authenticated;

  const organizations = await useCases.queries.user.getCurrentUserOrganizations(currentUser.id);

  return {
    currentUser,
    organizations,
    activeOrganizationId:
      activeOrganizationId ?? (await getDefaultActiveOrganization(headers, organizations)),
  };
});

const getDefaultActiveOrganization = async (
  headers: Request["headers"],
  organizationsWithRoles: { id: string; metadata?: any }[],
): Promise<string | null> => {
  const { auth } = await import("@/utils/auth");
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
    headers,
    body: { organizationId: orgToActivate.id },
  });

  return orgToActivate?.id ?? null;
};

import * as Sentry from "@sentry/tanstackstart-react";
import { createServerFn, type ServerFn, type ServerFnCtx } from "@tanstack/react-start";
import type { User } from "@tasks/core";
import { useCases } from "./bootstrap";

type AnyServerFnCtx = ServerFnCtx<any, any, any, any>;

const getRequestHeaders = (ctx: AnyServerFnCtx): Request["headers"] => {
  const { request } = ctx as unknown as { request: Request };
  return request.headers;
};

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
          activePlan: (session.user.activePlan as "pro" | null) || null,
          activeSubscriptionId: session.user.activeSubscriptionId || null,
          preferredLocale: (session.user.preferredLocale as "en" | "fr" | null) || null,
        },
        activeOrganizationId: session.session.activeOrganizationId ?? null,
      };
    },
  );
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
      activeOrganizationId: string | null;
    },
  ) => TResponse;
}) =>
  (async (ctx) => {
    return Sentry.startSpan(
      {
        op: "useCase",
        name: params.name,
      },
      async () => {
        const headers = getRequestHeaders(ctx);
        const authenticated = await getCurrentUserAndActiveOrganisationId(headers);
        if (!authenticated) throw new Response("Unauthorized", { status: 401 });
        const { currentUser, activeOrganizationId } = authenticated;

        Sentry.setUser({ id: currentUser.id });

        return params.handler({ ...ctx, currentUser, activeOrganizationId });
      },
    );
  }) as ServerFn<TRegister, TMethod, TMiddlewares, TInputValidator, TResponse>;

export const getAuthContextFn = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const headers = getRequestHeaders(ctx);
  const authenticated = await getCurrentUserAndActiveOrganisationId(headers);
  if (!authenticated) return null;

  const { currentUser, activeOrganizationId } = authenticated;

  const organizations = await useCases.getCurrentUserOrganizations({
    currentUser,
  });

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

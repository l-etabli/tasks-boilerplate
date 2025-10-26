import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";
import { getAuthContextFn } from "@/server/functions/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const authContext = await getAuthContextFn();

    if (!authContext) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return authContext;
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, organizations } = Route.useRouteContext();
  const needsOrganization = organizations.length === 0;

  if (needsOrganization) {
    return <CreateOrganizationModal user={user} />;
  }

  return <Outlet />;
}

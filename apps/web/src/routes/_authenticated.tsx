import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "@/components/Header";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";
import { getAuthContextFn } from "@/server/functions/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const authContext = await getAuthContextFn();

    if (!authContext || !authContext.currentUser) {
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
  const { currentUser, organizations, activeOrganizationId } = Route.useRouteContext();
  const needsOrganization = organizations.length === 0;

  if (needsOrganization) {
    return <CreateOrganizationModal currentUser={currentUser} />;
  }

  return (
    <Header organizations={organizations} activeOrganizationId={activeOrganizationId}>
      <Outlet />
    </Header>
  );
}

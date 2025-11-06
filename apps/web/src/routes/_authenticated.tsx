import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
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
  const { organizations, activeOrganizationId } = Route.useRouteContext();
  const location = useLocation();
  const needsOrganization = organizations.length === 0;

  // Don't show org creation modal on invitation acceptance page
  const isInvitationPage = location.pathname.includes("/accept-invitation/");

  if (needsOrganization && !isInvitationPage) {
    return <CreateOrganizationModal />;
  }

  return (
    <Header organizations={organizations} activeOrganizationId={activeOrganizationId}>
      <Outlet />
    </Header>
  );
}

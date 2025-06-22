import { authClient } from "@/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // Optionally, you can return data to be used in the component
    return { user: session.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // const { session } = Route.useRouteContext(); // Example if you return data from beforeLoad
  return <Outlet />;
}

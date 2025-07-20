import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location, context }) => {
    const session = context.session;

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    return { user: session.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // const { session } = Route.useRouteContext(); // Example if you return data from beforeLoad
  return <Outlet />;
}

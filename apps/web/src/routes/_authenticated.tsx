import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUserFn } from "@/server/functions/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn();

    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user };
  },
  component: () => <Outlet />,
});

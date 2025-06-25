import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_subscribed")({
  beforeLoad: async ({ location, context }) => {
    const { user } = context;

    if (!user.activePlan) {
      throw redirect({
        to: "/subscription-required",
        search: {
          redirect: location.href,
        },
      });
    }

    return { user };
  },
  component: SubscriptionLayout,
});

function SubscriptionLayout() {
  return <Outlet />;
}

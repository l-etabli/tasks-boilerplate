import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_subscribed")({
  beforeLoad: async ({ location, context }) => {
    const { session } = context;

    if (!session.user.activePlan) {
      throw redirect({
        to: "/subscription-required",
        search: {
          redirect: location.href,
        },
      });
    }

    return { session };
  },
  component: SubscriptionLayout,
});

function SubscriptionLayout() {
  return <Outlet />;
}

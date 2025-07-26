import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "../../providers/SessionProvider";

export const Route = createFileRoute("/_authenticated/_subscribed")({
  component: SubscriptionLayout,
});

function SubscriptionLayout() {
  const { currentUser } = useCurrentUser();

  if (!currentUser || !currentUser.activePlan) {
    return <div>Redirecting to subscription...</div>;
  }

  return <Outlet />;
}

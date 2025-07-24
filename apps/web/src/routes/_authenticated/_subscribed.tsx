import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../../providers/SessionProvider";

export const Route = createFileRoute("/_authenticated/_subscribed")({
  component: SubscriptionLayout,
});

function SubscriptionLayout() {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && session && !session.user.activePlan) {
      navigate({
        to: "/subscription-required",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  }, [session, isLoading, navigate]);

  // Show loading while checking session
  if (isLoading) {
    return <div>Checking subscription...</div>;
  }

  // Show loading while redirecting
  if (!session || !session.user.activePlan) {
    return <div>Redirecting to subscription...</div>;
  }

  return <Outlet />;
}

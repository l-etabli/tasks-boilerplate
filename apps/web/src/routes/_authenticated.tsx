import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../providers/SessionProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  }, [session, isLoading, navigate]);

  // Show loading while checking session
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // Show loading while redirecting
  if (!session) {
    return <div>Redirecting to login...</div>;
  }

  return <Outlet />;
}

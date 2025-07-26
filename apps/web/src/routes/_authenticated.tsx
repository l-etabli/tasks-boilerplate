import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../providers/SessionProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, isLoading } = useSession();
  const currentUser = session?.user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
  }, [currentUser, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // Show loading while redirecting
  if (!currentUser) {
    return <div>Redirecting to login...</div>;
  }

  return <Outlet />;
}

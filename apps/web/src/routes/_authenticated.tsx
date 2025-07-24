import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../providers/SessionProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  console.log("[SESSION DEBUG] AuthenticatedLayout rendering");
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  console.log(
    "[SESSION DEBUG] AuthenticatedLayout session check:",
    session ? "logged in" : "not logged in",
    "loading:",
    isLoading,
  );

  useEffect(() => {
    if (!isLoading && !session) {
      console.log("[SESSION DEBUG] AuthenticatedLayout redirecting to login");
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
    console.log("[SESSION DEBUG] AuthenticatedLayout showing loading");
    return <div>Checking authentication...</div>;
  }

  // Show loading while redirecting
  if (!session) {
    console.log("[SESSION DEBUG] AuthenticatedLayout showing redirecting message");
    return <div>Redirecting to login...</div>;
  }

  console.log("[SESSION DEBUG] AuthenticatedLayout rendering outlet");
  return <Outlet />;
}

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? <div>Checking authentication...</div> : <Outlet />}
    </div>
  );
}

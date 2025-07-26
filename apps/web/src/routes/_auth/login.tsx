import { LoggedInAs } from "@/components/LoggedInAs";
import { LoginWithGoogle } from "@/components/LoginWithGoogle";
import { LogoutButton } from "@/components/LogoutButton";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";
import { useSession } from "../../providers/SessionProvider";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useSession();
  const currentUser = session?.user;
  const navigate = useNavigate();
  const { redirect: redirectUrl } = Route.useSearch();

  React.useEffect(() => {
    if (currentUser && redirectUrl) {
      navigate({ to: redirectUrl });
    }
  }, [currentUser, redirectUrl, navigate]);

  return (
    <div>
      Hello "/login" route !
      <br />
      {currentUser && <LogoutButton />}
      {currentUser && <LoggedInAs user={currentUser} />}
      {!currentUser && <LoginWithGoogle redirectUrl={redirectUrl} />}
    </div>
  );
}

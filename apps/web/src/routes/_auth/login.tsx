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
  console.log("[SESSION DEBUG] Login component rendering");
  const { session } = useSession();
  console.log(
    "[SESSION DEBUG] Login session from context:",
    session ? "logged in" : "not logged in",
  );
  const navigate = useNavigate();
  const { redirect: redirectUrl } = Route.useSearch();

  React.useEffect(() => {
    if (session && redirectUrl) {
      navigate({ to: redirectUrl });
    }
  }, [session, redirectUrl, navigate]);

  return (
    <div>
      Hello "/login" route !
      <br />
      {session && <LogoutButton />}
      {session && <LoggedInAs user={session.user} />}
      {!session && <LoginWithGoogle redirectUrl={redirectUrl} />}
    </div>
  );
}

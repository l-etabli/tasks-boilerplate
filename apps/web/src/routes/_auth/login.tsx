import { authClient } from "@/auth-client";
import { LoggedInAs } from "@/components/LoggedInAs";
import { LoginWithGoogle } from "@/components/LoginWithGoogle";
import { LogoutButton } from "@/components/LogoutButton";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
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

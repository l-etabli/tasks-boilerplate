import { authClient } from "@/auth-client";
import type { FileRoutesByTo } from "@/routeTree.gen";

interface LoginWithGoogleProps {
  redirectUrl?: string;
}

export const LoginWithGoogle = ({ redirectUrl }: LoginWithGoogleProps) => {
  const loginRoute: `${keyof FileRoutesByTo}` = "/login";
  return (
    <button
      className="font-bold"
      type={"button"}
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL: redirectUrl
            ? `${loginRoute}?redirect=${encodeURIComponent(redirectUrl)}`
            : loginRoute,
        })
      }
    >
      Login with Google
    </button>
  );
};

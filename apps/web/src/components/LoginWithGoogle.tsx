import { Button } from "@tasks/ui/components/button";
import { authClient } from "@/auth-client";

interface LoginWithGoogleProps {
  redirectUrl?: string;
}

export function LoginWithGoogle({ redirectUrl }: LoginWithGoogleProps) {
  const handleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: redirectUrl || "/",
    });
  };

  return (
    <Button
      type="button"
      onClick={handleLogin}
      className="w-full bg-blue-600 text-white hover:bg-blue-700"
      size="lg"
    >
      Sign in with Google
    </Button>
  );
}

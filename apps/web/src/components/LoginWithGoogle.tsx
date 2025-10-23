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
    <button
      type="button"
      onClick={handleLogin}
      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Sign in with Google
    </button>
  );
}

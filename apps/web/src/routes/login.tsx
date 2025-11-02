import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: search.redirect as string | undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { LL } = useI18nContext();

  const handleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: redirect || "/",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{LL.auth.signInTitle()}</h1>
          <p className="mt-2 text-gray-600">{LL.auth.signInSubtitle()}</p>
        </div>
        <Button id="btn-login-google" onClick={handleLogin} className="w-full" size="lg">
          {LL.auth.signInWithGoogle()}
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@tasks/ui/components/button";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

type AuthFormProps = {
  callbackURL?: string;
  className?: string;
};

export function AuthForm({ callbackURL = "/", className }: AuthFormProps) {
  const { LL } = useI18nContext();

  const handleGoogleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  return (
    <div className={className}>
      <Button id="btn-login-google" onClick={handleGoogleLogin} className="w-full" size="lg">
        {LL.auth.signInWithGoogle()}
      </Button>
    </div>
  );
}

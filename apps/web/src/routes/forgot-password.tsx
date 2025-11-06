import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";
import { authSessionStorage } from "@/utils/auth-session-storage";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { LL } = useI18nContext();
  const [email, setEmail] = useState(authSessionStorage.getAuthEmail() || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      setResetLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : LL.auth.authenticationFailed());
    } finally {
      setIsLoading(false);
    }
  };

  if (resetLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{LL.auth.resetPassword()}</h1>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
            <p className="text-sm text-green-800 dark:text-green-200">{LL.auth.resetLinkSent()}</p>
          </div>

          <Button asChild className="w-full" variant="outline">
            <Link to="/login">{LL.auth.signIn()}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">{LL.auth.resetPasswordTitle()}</h1>
          <p className="text-muted-foreground">{LL.auth.resetPasswordDescription()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="email">{LL.auth.email()}</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                authSessionStorage.saveAuthEmail(value);
              }}
              required
              disabled={isLoading}
            />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {LL.auth.sendResetLink()}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">{LL.common.back()}</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}

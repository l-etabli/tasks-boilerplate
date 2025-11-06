import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: resetPasswordSearchSchema,
});

function ResetPasswordPage() {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(LL.auth.passwordMismatch());
      return;
    }

    if (!token) {
      setError(LL.auth.invalidToken());
      return;
    }

    setIsLoading(true);

    try {
      await authClient.resetPassword({
        newPassword,
        token,
      });

      // Show success message and redirect to login
      await navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : LL.auth.authenticationFailed());
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{LL.auth.resetPassword()}</h1>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{LL.auth.invalidToken()}</p>
          </div>

          <Button asChild className="w-full">
            <Link to="/forgot-password">{LL.auth.forgotPassword()}</Link>
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="newPassword">{LL.auth.newPassword()}</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">{LL.auth.confirmPassword()}</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {LL.auth.updatePassword()}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">{LL.common.back()}</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}

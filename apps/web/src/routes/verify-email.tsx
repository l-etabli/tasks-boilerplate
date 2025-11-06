import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { z } from "zod";
import { useI18nContext } from "@/i18n/i18n-react";

const verifyEmailSearchSchema = z.object({
  error: z.string().optional(),
});

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
  validateSearch: verifyEmailSearchSchema,
});

function VerifyEmailPage() {
  const { LL } = useI18nContext();
  const { error: errorParam } = Route.useSearch();

  // Better Auth handles verification on server-side and redirects here
  // If there's an error param, show error. Otherwise, verification succeeded
  const isError = !!errorParam;
  const errorMessage = isError ? LL.auth.verificationFailed() : "";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">{LL.auth.verifyEmailTitle()}</h1>
        </div>

        {!isError && (
          <>
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                {LL.auth.emailVerified()}
              </p>
            </div>

            <Button asChild className="w-full">
              <Link to="/">{LL.common.confirm()}</Link>
            </Button>
          </>
        )}

        {isError && (
          <>
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/login">{LL.auth.signIn()}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

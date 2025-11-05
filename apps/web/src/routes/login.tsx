import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/auth-form";
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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{LL.auth.signInTitle()}</h1>
          <p className="mt-2 text-gray-600">{LL.auth.signInSubtitle()}</p>
        </div>
        <AuthForm callbackURL={redirect || "/"} />
      </div>
    </div>
  );
}

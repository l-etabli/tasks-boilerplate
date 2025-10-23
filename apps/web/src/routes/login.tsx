import { createFileRoute } from "@tanstack/react-router";
import { LoginWithGoogle } from "@/components/LoginWithGoogle";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: search.redirect as string | undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Sign in to access your account</p>
        </div>
        <div className="mt-8">
          <LoginWithGoogle redirectUrl={redirect} />
        </div>
      </div>
    </div>
  );
}

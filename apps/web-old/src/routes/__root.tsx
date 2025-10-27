import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Sentry } from "@tasks/sentry/client";
import { env } from "@/env";
import Header from "../components/Header";
import { useI18nContext } from "../i18n/i18n-react";
import type { Locales } from "../i18n/i18n-types";
import TanstackQueryLayout from "../integrations/tanstack-query/layout";
import { I18nProvider } from "../providers/I18nProvider";
import { SessionProvider, useSession } from "../providers/SessionProvider";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: Sentry.withErrorBoundary(
    () => (
      <RootDocument>
        <SessionProvider>
          <AppWithI18n />
        </SessionProvider>
      </RootDocument>
    ),
    {
      fallback: ({ error }: { error: unknown }) => (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <Link to="/" className="text-blue-500 hover:underline">
            Go back to Home
          </Link>
        </div>
      ),
    },
  ),

  notFoundComponent: () => (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  ),
});

function AppWithI18n() {
  const { session } = useSession();

  // Extract user's preferred locale from session, fallback to undefined for client detection
  const userPreferredLocale: Locales | undefined = session?.user?.preferredLocale;

  return (
    <I18nProvider initialLocale={userPreferredLocale}>
      <Header />
      <Outlet />
      {env.ENVIRONMENT === "local" && <TanStackRouterDevtools />}
      <TanstackQueryLayout />
    </I18nProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useI18nContext();

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

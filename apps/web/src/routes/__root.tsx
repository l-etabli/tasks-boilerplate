import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { UserPreferences } from "@tasks/core";
import { ThemeProvider } from "@tasks/ui/components/theme-provider";
import Header from "@/components/Header";
import { env } from "@/env";
import { useI18nContext } from "@/i18n/i18n-react";
import type { Locales } from "@/i18n/i18n-types";
import { I18nProvider } from "@/providers/I18nProvider";
import { SessionProvider, useCurrentUser } from "@/providers/SessionProvider";
import { getAuthContextFn } from "@/server/functions/auth";
import { updateUserPreferences } from "@/server/functions/user";
import appCss from "@/styles.css?url";
import { getClientPreferences, setClientPreferences } from "@/utils/preferences";

export type RootRouteContext = {
  preferences: UserPreferences;
};

export const Route = createRootRoute({
  beforeLoad: async () => {
    try {
      const authContext = await getAuthContextFn();
      // getAuthContextFn now merges cookie preferences with DB preferences server-side
      const preferences = authContext?.currentUser?.preferences ?? null;
      return {
        preferences,
      };
    } catch {
      // Not logged in or error fetching auth
      return {
        preferences: null,
      };
    }
  },

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
        title: "Tasks",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  errorComponent: ({ error }: { error: unknown }) => <RootComponent error={error} />,
});

function RootComponent({ error }: { error?: unknown }) {
  return <RootApp error={error} />;
}

function RootApp({ error }: { error?: unknown }) {
  return (
    <SessionProvider>
      <SessionAwareI18n error={error} />
    </SessionProvider>
  );
}

function SessionAwareI18n({ error }: { error?: unknown }) {
  const { currentUser } = useCurrentUser();
  const routeContext = useRouteContext({
    from: "__root__",
    select: (ctx: RootRouteContext) => ctx,
  });

  // Read from client cookie to get most recent preference
  const clientPreferences = typeof window !== "undefined" ? getClientPreferences() : null;

  const preferences = {
    ...(routeContext?.preferences ?? {}),
    ...(currentUser?.preferences ?? {}),
    ...(clientPreferences ?? {}),
  };

  const initialLocale = (preferences?.locale as Locales | null) ?? null;

  const handleLocaleChange = async (locale: Locales) => {
    if (!currentUser) return;

    try {
      await updateUserPreferences({
        data: { locale },
      });
    } catch (error) {
      console.error("Failed to persist locale preference:", error);
    }
  };

  // initialLocale now includes cookie preferences merged server-side, preventing flash
  return (
    <I18nProvider initialLocale={initialLocale} onLocaleChange={handleLocaleChange}>
      <SessionAwareTheme error={error} />
    </I18nProvider>
  );
}

function SessionAwareTheme({ error }: { error?: unknown }) {
  const { currentUser } = useCurrentUser();
  const routeContext = useRouteContext({
    from: "__root__",
    select: (ctx: RootRouteContext) => ctx,
  });

  // Read from client cookie to get most recent preference (prevents stale data when locale changes)
  const clientPreferences = typeof window !== "undefined" ? getClientPreferences() : null;

  const preferences = {
    ...(routeContext?.preferences ?? {}),
    ...(currentUser?.preferences ?? {}),
    ...(clientPreferences ?? {}),
  };

  const initialTheme = (preferences?.theme as "light" | "dark" | "system" | null) ?? undefined;

  const handleThemeChange = async (theme: string) => {
    setClientPreferences({ theme: theme as "light" | "dark" | "system" });

    if (!currentUser) return;

    try {
      await updateUserPreferences({
        data: { theme: theme as "light" | "dark" | "system" },
      });
    } catch (error) {
      console.error("Failed to persist theme preference:", error);
    }
  };

  return (
    <ThemeProvider
      initialTheme={initialTheme}
      onThemeChange={handleThemeChange}
      defaultTheme="system"
    >
      <LocaleAwareDocument>
        <BodyContent error={error} />
      </LocaleAwareDocument>
    </ThemeProvider>
  );
}

function LocaleAwareDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useI18nContext();
  const routeContext = useRouteContext({
    from: "__root__",
    select: (ctx: RootRouteContext) => ctx,
  });
  const serverPreferences = routeContext?.preferences ?? null;

  return (
    <html lang={locale}>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: We expose server preferences for inline script.
          dangerouslySetInnerHTML={{
            __html: `window.__serverPreferences = ${JSON.stringify(serverPreferences)};`,
          }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Inline script to prevent theme flash during SSR hydration.
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = window.__serverPreferences?.theme || 'system';
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark');

                  if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.add(prefersDark ? 'dark' : 'light');
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body className="bg-white dark:bg-slate-950">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function BodyContent({ error }: { error?: unknown }) {
  return (
    <>
      {error ? <ErrorBoundaryContent error={error} /> : <AppLayout />}
      {env.VITE_ENVIRONMENT === "local" && (
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  );
}

function AppLayout() {
  return (
    <Header>
      <Outlet />
    </Header>
  );
}

function ErrorBoundaryContent({ error }: { error: unknown }) {
  const { LL } = useI18nContext();

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">{LL.errors.genericTitle()}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error instanceof Error ? error.message : LL.errors.genericDescription()}
      </p>
      <Link to="/todos" className="text-blue-500 hover:underline dark:text-blue-400">
        {LL.errors.goBackTodos()}
      </Link>
    </div>
  );
}

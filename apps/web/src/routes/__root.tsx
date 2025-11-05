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
import { Toaster } from "@tasks/ui/components/sonner";
import { ThemeProvider } from "@tasks/ui/components/theme-provider";
import type { authClient } from "@/auth-client";
import { env } from "@/env";
import { useI18nContext } from "@/i18n/i18n-react";
import type { Locales } from "@/i18n/i18n-types";
import { useGlobalTracking } from "@/lib/useGlobalTracking";
import { I18nProvider } from "@/providers/I18nProvider";
import { SessionProvider, useCurrentUser } from "@/providers/SessionProvider";
import { getAuthContextFn } from "@/server/functions/auth";
import { updateUserPreferences } from "@/server/functions/user";
import appCss from "@/styles.css?url";
import { getClientPreferences, setClientPreferences } from "@/utils/preferences";

type SessionData = ReturnType<typeof authClient.useSession>["data"];

export type RootRouteContext = {
  preferences: UserPreferences;
  session: SessionData | null;
};

export const Route = createRootRoute({
  beforeLoad: async () => {
    try {
      const authContext = await getAuthContextFn();
      const preferences = authContext?.preferences ?? null; // comming from db or cookies
      const session = authContext?.session ?? null;
      return {
        preferences,
        session,
      };
    } catch {
      // Error fetching auth
      return {
        preferences: null,
        session: null,
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
  const routeContext = useRouteContext({
    from: "__root__",
    select: (ctx: RootRouteContext) => ctx,
  });

  return (
    <SessionProvider initialSession={routeContext?.session ?? null}>
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

  // Calculate initial theme class to prevent hydration mismatch
  // This must match what the inline script does
  const getInitialThemeClass = () => {
    if (typeof window === "undefined") {
      // Server-side: use server preferences, default to 'light' for SSR
      const theme = serverPreferences?.theme ?? "system";
      // On server, we can't detect system preference, so default to 'light' for 'system'
      return theme === "dark" ? "dark" : "light";
    }
    // Client-side: this will be hydrated, matching the inline script's logic
    return "light"; // Placeholder, inline script will have already run
  };

  const initialThemeClass = getInitialThemeClass();

  return (
    <html lang={locale} className={initialThemeClass}>
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
                  // Read from cookies (same as client-side code does)
                  function getCookie(name) {
                    const value = '; ' + document.cookie;
                    const parts = value.split('; ' + name + '=');
                    if (parts.length === 2) {
                      try {
                        return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
                      } catch (e) {
                        return null;
                      }
                    }
                    return null;
                  }

                  const cookiePrefs = getCookie('preferences');
                  const theme = cookiePrefs?.theme || window.__serverPreferences?.theme || 'system';
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
        {env.VITE_UMAMI_WEBSITE_ID && env.VITE_UMAMI_SCRIPT_URL && (
          <script
            defer
            src={env.VITE_UMAMI_SCRIPT_URL}
            data-website-id={env.VITE_UMAMI_WEBSITE_ID}
          />
        )}
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
  useGlobalTracking();

  return (
    <>
      {error ? <ErrorBoundaryContent error={error} /> : <AppLayout />}
      <Toaster />
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
  return <Outlet />;
}

function ErrorBoundaryContent({ error }: { error: unknown }) {
  const { LL } = useI18nContext();

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">{LL.errors.genericTitle()}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error instanceof Error ? error.message : LL.errors.genericDescription()}
      </p>
      <Link
        id="link-error-back-to-todos"
        to="/todos"
        className="text-blue-500 hover:underline dark:text-blue-400"
      >
        {LL.errors.goBackTodos()}
      </Link>
    </div>
  );
}

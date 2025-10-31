import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { UserPreferences } from "@tasks/core";
import { ThemeProvider } from "@tasks/ui/components/theme-provider";
import Header from "@/components/Header";
import { env } from "@/env";
import { useI18nContext } from "@/i18n/i18n-react";
import type { Locales } from "@/i18n/i18n-types";
import { I18nProvider } from "@/providers/I18nProvider";
import { SessionProvider, useCurrentUser } from "@/providers/SessionProvider";
import { updateUserPreferences } from "@/server/functions/user";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
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
  const userPreferences = (currentUser?.preferences as UserPreferences | null) ?? null;
  const initialLocale = (userPreferences?.locale as Locales | null) ?? null;

  return (
    <I18nProvider initialLocale={initialLocale}>
      <SessionAwareTheme error={error} />
    </I18nProvider>
  );
}

function SessionAwareTheme({ error }: { error?: unknown }) {
  const { currentUser } = useCurrentUser();
  const userPreferences = (currentUser?.preferences as UserPreferences | null) ?? null;
  const initialTheme = (userPreferences?.theme as "light" | "dark" | "system" | null) ?? undefined;

  const handleThemeChange = async (theme: string) => {
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
      storageKey="theme"
    >
      <LocaleAwareDocument>
        <BodyContent error={error} />
      </LocaleAwareDocument>
    </ThemeProvider>
  );
}

function LocaleAwareDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useI18nContext();

  return (
    <html lang={locale}>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: We need the inline script to prevent the white flash on page load.
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.add(prefersDark ? 'dark' : 'light');
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {
                  // localStorage not available, fallback to light
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

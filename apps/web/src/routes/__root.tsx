import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@tasks/ui/components/theme-provider";
import { env } from "@/env";
import Header from "../components/Header";
import { SessionProvider } from "../providers/SessionProvider";
import appCss from "../styles.css?url";

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

  component: RootDocument,
  errorComponent: ({ error }: { error: unknown }) => (
    <RootDocument>
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Link to="/todos" className="text-blue-500 hover:underline dark:text-blue-400">
          Go back to Todos
        </Link>
      </div>
    </RootDocument>
  ),
});

function RootDocument({ children }: { children?: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-white dark:bg-slate-950">
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <SessionProvider>
            <Header>{children || <Outlet />}</Header>
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
          </SessionProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

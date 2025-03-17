import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ModeToggle } from "@tasks/ui/components/mode-toggle";
import { ThemeProvider } from "@tasks/ui/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="fixed top-0 right-0 p-4">
          <ModeToggle />
        </div>
        <div className="mt-4">
          <Outlet />
        </div>
      </ThemeProvider>
      <TanStackRouterDevtools />
    </>
  ),
});

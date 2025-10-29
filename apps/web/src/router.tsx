import { createRouter } from "@tanstack/react-router";
import { initSentry } from "./lib/sentry";
import { initServerSentry } from "./lib/sentry.server";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Initialize server-side Sentry if running on server
if (typeof window === "undefined") {
  initServerSentry();
}

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  initSentry(router);

  return router;
};

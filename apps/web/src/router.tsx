import { createRouter } from "@tanstack/react-router";
import { initServerSentry } from "./lib/sentry";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Initialize server-side Sentry once at module load
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

  return router;
};

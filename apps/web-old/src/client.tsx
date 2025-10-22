import { type Environment, initClientSentry } from "@tasks/sentry/client";

const getSentryEnvironment = (): Environment => {
  const { hostname } = window.location;

  switch (true) {
    case hostname.includes("localhost"):
      return "local";
    case hostname.includes("staging"):
      return "staging";
    case hostname.includes("dev"):
      return "dev";
    default:
      return "production";
  }
};

initClientSentry(getSentryEnvironment());

import { RouterProvider } from "@tanstack/react-router";
import { hydrateRoot } from "react-dom/client";

import { getRouter } from "./router";

const router = getRouter();

hydrateRoot(document, <RouterProvider router={router} />);

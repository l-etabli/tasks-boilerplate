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
import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";

import { createRouter } from "./router";

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);

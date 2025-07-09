import { initClientSentry } from "@tasks/sentry/client";
import { env } from "./env";

initClientSentry(env.VITE_ENVIRONMENT);
import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";

import { createRouter } from "./router";

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);

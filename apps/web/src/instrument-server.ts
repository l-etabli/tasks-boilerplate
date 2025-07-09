import { initServerSentry } from "@l-etabli/sentry/server";
import { env } from "./env";

initServerSentry(env.VITE_ENVIRONMENT);

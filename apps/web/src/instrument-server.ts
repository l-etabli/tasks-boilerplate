import { initServerSentry } from "@tasks/sentry/server";
import { env } from "./env";

initServerSentry(env.VITE_ENVIRONMENT);

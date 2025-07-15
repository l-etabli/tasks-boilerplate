import { initServerSentryWithOTEL } from "@tasks/sentry/server";
import { env } from "./env";

initServerSentryWithOTEL(env.ENVIRONMENT);

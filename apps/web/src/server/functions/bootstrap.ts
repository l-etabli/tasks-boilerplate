import * as Sentry from "@sentry/tanstackstart-react";
import { bootstrapUseCases, type GatewaysConfig } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { env } from "@/env";

const getGatewayConfig = (): GatewaysConfig => {
  const defaultEmailFrom = env.EMAIL_FROM ?? "contact@etabli.dev";

  if (env.EMAIL_GATEWAY === "resend") {
    if (!env.EMAIL_RESEND_API_KEY) throw new Error("EMAIL_RESEND_API_KEY is not set");
    return {
      kind: "resend",
      resendApiKey: env.EMAIL_RESEND_API_KEY,
      defaultEmailFrom,
    };
  }
  return {
    kind: "inMemory",
    defaultEmailFrom,
  };
};

const bootstrap = bootstrapUseCases({
  dbConfig: {
    kind: "pg",
    db: getKyselyDb(Sentry),
  },
  gatewaysConfig: getGatewayConfig(),
});

export const useCases = {
  queries: bootstrap.queries,
  mutations: bootstrap.mutations,
};

export const gateways = bootstrap.gateways;

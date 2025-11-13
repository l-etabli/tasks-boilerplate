import * as Sentry from "@sentry/tanstackstart-react";
import { bootstrapUseCases, type GatewaysConfig } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { env } from "@/env";

const getEmailConfig = (): GatewaysConfig["email"] => {
  const defaultEmailFrom = env.EMAIL_FROM ?? "contact@etabli.dev";

  if (env.EMAIL_GATEWAY === "resend") {
    if (!env.EMAIL_RESEND_API_KEY)
      throw new Error("EMAIL_GATEWAY=resend requires: EMAIL_RESEND_API_KEY");

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

const getFileConfig = (): GatewaysConfig["file"] => {
  if (env.FILE_GATEWAY === "s3") {
    if (
      !env.S3_ENDPOINT ||
      !env.S3_ACCESS_KEY_ID ||
      !env.S3_SECRET_ACCESS_KEY ||
      !env.S3_PUBLIC_BUCKET ||
      !env.S3_PRIVATE_BUCKET ||
      !env.S3_PUBLIC_URL
    )
      throw new Error(
        "FILE_GATEWAY=s3 requires: S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BUCKET, S3_PRIVATE_BUCKET, S3_PUBLIC_URL",
      );

    return {
      kind: "s3",
      s3Config: {
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION,
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        publicBucket: env.S3_PUBLIC_BUCKET,
        privateBucket: env.S3_PRIVATE_BUCKET,
        publicUrl: env.S3_PUBLIC_URL,
      },
    };
  }

  return {
    kind: "inMemory",
  };
};

const getGatewayConfig = (): GatewaysConfig => {
  return {
    email: getEmailConfig(),
    file: getFileConfig(),
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

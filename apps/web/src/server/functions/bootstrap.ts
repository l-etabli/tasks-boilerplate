import * as Sentry from "@sentry/tanstackstart-react";
import { bootstrapUseCases } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";

export const useCases = bootstrapUseCases({
  kind: "pg",
  db: getKyselyDb(Sentry),
});

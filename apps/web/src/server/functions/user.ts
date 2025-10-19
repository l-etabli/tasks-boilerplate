import "../instrument-server";
import { createServerFn } from "@tanstack/react-start";
import { bootstrapUseCases, type User, updateUserPreferencesSchema } from "@tasks/core";
import { getKyselyDb } from "@tasks/db";
import { Sentry } from "@tasks/sentry/server";
import { getWebRequest } from "vinxi/http";
import { auth } from "@/utils/auth";

const useCases = bootstrapUseCases({ kind: "pg", db: getKyselyDb(Sentry) });

async function getCurrentUser(): Promise<User> {
  const request = getWebRequest();
  const session = await auth.api.getSession({
    headers: request.headers as any,
  });

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    activePlan: session.user.activePlan as "pro" | null,
    activeSubscriptionId: session.user.activeSubscriptionId,
    preferredLocale: session.user.preferredLocale as "en" | "fr" | null,
  };
}

export const updateUserPreferences = createServerFn({ method: "POST" })
  .inputValidator(updateUserPreferencesSchema)
  .handler(async ({ data }) => {
    const currentUser = await getCurrentUser();
    return useCases.updateUserPreferences({ currentUser, input: data });
  });

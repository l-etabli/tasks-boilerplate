import { createServerFn } from "@tanstack/react-start";
import type { User } from "@tasks/core";
import { auth } from "@/utils/auth";

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(async (ctx: unknown) => {
  const request = (ctx as { request: Request }).request;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return null;
  }

  const user: User = {
    id: session.user.id,
    email: session.user.email,
    activePlan: (session.user.activePlan as "pro" | null) || null,
    activeSubscriptionId: session.user.activeSubscriptionId || null,
    preferredLocale: (session.user.preferredLocale as "en" | "fr" | null) || null,
  };

  return user;
});

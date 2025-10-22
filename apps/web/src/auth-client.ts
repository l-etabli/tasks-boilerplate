import { createAuthClient } from "better-auth/react";

const baseURL =
  (import.meta.env?.VITE_BETTER_AUTH_URL as string | undefined) ??
  (typeof process !== "undefined" ? process.env?.BETTER_AUTH_URL : undefined);

if (!baseURL) {
  throw new Error("No BETTER_AUTH_URL provided");
}

export const authClient = createAuthClient({
  baseURL,
});

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/utils/auth.ts";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  fetchOnWindowFocus: false,
});

import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./utils/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), organizationClient()],
});

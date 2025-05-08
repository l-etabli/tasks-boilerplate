import { betterAuth } from "better-auth";
import { pgPool } from "./database";

export const auth = betterAuth({
  database: pgPool,
  emailAndPassword: {
    enabled: true,
  },
});

import { createServerFn } from "@tanstack/react-start";
import { updateUserPreferencesSchema } from "@tasks/core";
import { authenticated } from "./auth";
import { useCases } from "./bootstrap";

export const updateUserPreferences = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "updateUserPreferences" })])
  .inputValidator(updateUserPreferencesSchema)
  .handler(async ({ data, context: { currentUser } }) =>
    useCases.mutations.updateUserPreferences({
      currentUser,
      input: data,
    }),
  );

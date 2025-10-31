import { createServerFn } from "@tanstack/react-start";
import { updateUserPreferencesSchema } from "@tasks/core";
import { authenticated } from "./auth";
import { useCases } from "./bootstrap";

export const updateUserPreferences = createServerFn({ method: "POST" })
  .middleware([authenticated({ name: "updateUserPreferences" })])
  .inputValidator(updateUserPreferencesSchema)
  .handler(async (ctx) => {
    const {
      data,
      context: { currentUser },
    } = ctx;

    const result = await useCases.mutations.updateUserPreferences({
      currentUser,
      input: data,
    });

    return result;
  });

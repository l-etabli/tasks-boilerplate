import { expectToEqual } from "@tasks/test";
import { beforeEach, describe, it } from "vitest";
import { expectPromiseToFailWith } from "../../../../test/src/testUtils.js";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../adapters/inMemory/withInMemoryUow.js";
import { userFactory } from "../entities/userFactory.js";
import { updateUserPreferencesUseCase } from "./updateUserPreferences.js";

describe("updateUserPreferences", () => {
  let updateUserPreferences: ReturnType<typeof updateUserPreferencesUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    updateUserPreferences = updateUserPreferencesUseCase({
      withUow: uowConfig.withUow,
    });
  });

  it("should update user locale preference", async () => {
    helpers.user.userById[currentUser.id] = currentUser;

    const result = await updateUserPreferences({
      input: { locale: "fr" },
      currentUser,
    });

    expectToEqual(result.preferences?.locale, "fr");
    expectToEqual(helpers.user.userById[currentUser.id]?.preferences?.locale, "fr");
  });

  it("should update user theme preference", async () => {
    helpers.user.userById[currentUser.id] = currentUser;

    const result = await updateUserPreferences({
      input: { theme: "dark" },
      currentUser,
    });

    expectToEqual(result.preferences?.theme, "dark");
    expectToEqual(helpers.user.userById[currentUser.id]?.preferences?.theme, "dark");
  });

  it("should update both locale and theme preferences", async () => {
    helpers.user.userById[currentUser.id] = currentUser;

    const result = await updateUserPreferences({
      input: { locale: "en", theme: "light" },
      currentUser,
    });

    expectToEqual(result.preferences?.locale, "en");
    expectToEqual(result.preferences?.theme, "light");
    expectToEqual(helpers.user.userById[currentUser.id]?.preferences?.locale, "en");
    expectToEqual(helpers.user.userById[currentUser.id]?.preferences?.theme, "light");
  });

  it("should merge preferences with existing ones", async () => {
    const userWithPreferences = userFactory({
      preferences: { locale: "fr", theme: "dark" },
    });
    helpers.user.userById[userWithPreferences.id] = userWithPreferences;

    const result = await updateUserPreferences({
      input: { locale: "en" },
      currentUser: userWithPreferences,
    });

    expectToEqual(result.preferences?.locale, "en");
    expectToEqual(result.preferences?.theme, "dark");
  });

  it("should throw an error when user is not found", async () => {
    await expectPromiseToFailWith(
      updateUserPreferences({
        input: { locale: "fr" },
        currentUser,
      }),
      `User with id ${currentUser.id} not found`,
    );
  });
});

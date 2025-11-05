import { useCaseBuilder } from "@tasks/trousse";
import type { UpdateUserPreferencesInput, User } from "../entities/user-and-organization.js";
import type { Uow } from "../ports/Uow.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const updateUserPreferences = createAuthTransacUseCase
  .withInput<UpdateUserPreferencesInput>()
  .build(({ input, currentUser, uow }) => {
    return uow.userRepository.updatePreferences(currentUser.id, input);
  });

import { useCaseBuilder } from "@tasks/trousse";
import type { Uow } from "../../shared/ports/Uow.js";
import type { UpdateUserPreferencesInput, User } from "../entities/user-and-organization.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const updateUserPreferencesUseCase = createAuthTransacUseCase
  .withInput<UpdateUserPreferencesInput>()
  .build(({ input, currentUser, uow }) => {
    return uow.userRepository.updatePreferences(currentUser.id, input);
  });

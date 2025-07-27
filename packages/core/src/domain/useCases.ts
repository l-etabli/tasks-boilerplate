import { useCaseBuilder } from "@tasks/trousse";
import type {
  AddTaskInput,
  DeleteTaskInput,
  UpdateUserPreferencesInput,
  User,
} from "./entities.js";
import type { Uow } from "./ports.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const addTask = createAuthTransacUseCase
  .withInput<AddTaskInput>()
  .build(({ input, currentUser, uow }) => {
    return uow.taskRepository.save({
      ...input,
      owner: currentUser,
    });
  });

export const listMyTasks = createAuthTransacUseCase.build(async ({ currentUser, uow }) =>
  uow.taskRepository.getAllForUser(currentUser.id),
);

export const deleteTask = createAuthTransacUseCase
  .withInput<DeleteTaskInput>()
  .build(({ input, uow }) => {
    return uow.taskRepository.delete(input.id);
  });

export const updateUserPreferences = createAuthTransacUseCase
  .withInput<UpdateUserPreferencesInput>()
  .build(({ input, currentUser, uow }) => {
    return uow.userRepository.updatePreferences(currentUser.id, input);
  });

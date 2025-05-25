import { configureCreateUseCase } from "@tasks/trousse";
import type { AddTaskInput, User } from "./entities.js";
import type { Uow } from "./ports.js";

const createAuthTransacUseCase = configureCreateUseCase<Uow, User>();

type UseCaseParams<Input> = {
  input: Input;
  currentUser: User;
  uow: Uow;
};

export const addTask = createAuthTransacUseCase(
  ({ input, currentUser, uow }: UseCaseParams<AddTaskInput>) =>
    uow.taskRepository.save({
      ...input,
      owner: currentUser,
    }),
);

export const listMyTasks = createAuthTransacUseCase(({ currentUser, uow }) =>
  uow.taskRepository.getAllForUser(currentUser.id),
);

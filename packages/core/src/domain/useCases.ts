import { useCaseBuilder } from "@tasks/trousse";
import type { AddTaskInput, User } from "./entities.js";
import type { Uow } from "./ports.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const addTask = createAuthTransacUseCase
  .withInput<AddTaskInput>()
  .build(({ input, currentUser, uow }) =>
    uow.taskRepository.save({
      ...input,
      owner: currentUser,
    }),
  );

export const listMyTasks = createAuthTransacUseCase.build(({ currentUser, uow }) =>
  uow.taskRepository.getAllForUser(currentUser.id),
);

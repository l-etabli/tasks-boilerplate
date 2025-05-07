import { type CreateUseCase, createUseCase } from "@tasks/trousse";
import type { AddTaskInput, Task, User } from "./entities.js";
import type { Uow } from "./ports.js";

const createAuthTransacUseCase: CreateUseCase<Uow, User> = createUseCase;

export const addTask = createAuthTransacUseCase<AddTaskInput, Promise<void>>(
  ({ input, currentUser, uow }) =>
    uow.taskRepository.save({
      ...input,
      owner: currentUser,
    }),
);

export const listMyTasks = createAuthTransacUseCase<void, Promise<Task[]>>(({ currentUser, uow }) =>
  uow.taskRepository.getAllForUser(currentUser.id),
);

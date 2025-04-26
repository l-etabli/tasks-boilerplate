import { type CreateUseCase, createUseCase } from "@tasks/trousse";
import type { AddTaskInput, Task, Uow, User } from "./entities-and-ports.js";

const createAuthTransacUseCase: CreateUseCase<Uow, User> = createUseCase;

export const addTask = createAuthTransacUseCase<AddTaskInput, Promise<void>>(
  ({ inputParams, currentUser, uow }) =>
    uow.taskRepository.save({
      ...inputParams,
      owner: currentUser,
    }),
);

export const listMyTasks = createAuthTransacUseCase<void, Promise<Task[]>>(({ currentUser, uow }) =>
  uow.taskRepository.getAllForUser(currentUser.id),
);

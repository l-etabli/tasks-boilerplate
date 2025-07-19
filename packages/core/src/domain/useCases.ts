import { useCaseBuilder } from "@tasks/trousse";
import type { AddTaskInput, User } from "./entities.js";
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

export const listMyTasks = createAuthTransacUseCase.build(async ({ currentUser, uow }) => {
  // call a placeholder api, just to analyse how it appears in sentry trace

  console.time("fetching jsonplaceholder");
  await fetch("https://jsonplaceholder.typicode.com/todos/1").then((res) => res.json());
  console.timeEnd("fetching jsonplaceholder");

  return uow.taskRepository.getAllForUser(currentUser.id);
});

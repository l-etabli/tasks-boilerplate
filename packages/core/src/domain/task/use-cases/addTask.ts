import { useCaseBuilder } from "@tasks/trousse";
import type { Uow } from "../../shared/ports/Uow.js";
import type { User } from "../../user/entities/user-and-organization.js";
import type { AddTaskInput } from "../entities/task.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const addTaskUseCase = createAuthTransacUseCase
  .withInput<AddTaskInput>()
  .build(({ input, currentUser, uow }) => {
    return uow.taskRepository.save({
      ...input,
      owner: currentUser,
    });
  });

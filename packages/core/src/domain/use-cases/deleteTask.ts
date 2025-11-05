import { useCaseBuilder } from "@tasks/trousse";
import type { DeleteTaskInput } from "../entities/task.js";
import type { User } from "../entities/user-and-organization.js";
import type { Uow } from "../ports/Uow.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const deleteTask = createAuthTransacUseCase
  .withInput<DeleteTaskInput>()
  .build(({ input, uow }) => {
    return uow.taskRepository.delete(input.id);
  });

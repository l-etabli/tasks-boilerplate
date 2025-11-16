import { useCaseBuilder } from "@tasks/trousse";
import type { Uow } from "../../shared/ports/Uow.js";
import type { User } from "../../user/entities/user-and-organization.js";
import type { DeleteTaskInput } from "../entities/task.js";

const createAuthTransacUseCase = useCaseBuilder().withUow<Uow>().withCurrentUser<User>();

export const deleteTaskUseCase = createAuthTransacUseCase
  .withInput<DeleteTaskInput>()
  .build(async ({ input, uow, currentUser }) => {
    const task = await uow.taskRepository.getTaskById(input.id);
    if (!task) throw new Error("Task not found");
    if (task.owner.id !== currentUser.id) throw new Error("Not your task");
    return uow.taskRepository.delete(input.id);
  });

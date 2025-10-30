import type { Organization, Task } from "../domain/entities.js";
import type { TaskQueries, UserQueries } from "../domain/ports.js";

export const createInMemoryTaskQueries = (taskById: Record<string, Task>): TaskQueries => ({
  getAllTasksForUser: async (userId) =>
    Object.values(taskById).filter((task) => task.owner.id === userId),
});

export const createInMemoryUserQueries = (
  organizationsById: Record<string, Organization>,
): UserQueries => ({
  getCurrentUserOrganizations: async (userId) =>
    Object.values(organizationsById).filter((org) =>
      org.members.some((member) => member.userId === userId),
    ),
});

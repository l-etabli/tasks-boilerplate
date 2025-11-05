import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteTask } from "./deleteTask.js";
import type { Uow } from "../ports/Uow.js";
import type { User } from "../entities/user-and-organization.js";
import type { DeleteTaskInput } from "../entities/task.js";

describe("deleteTask use case", () => {
	let mockUow: Uow;
	let mockCurrentUser: User;
	let mockWithUow: (cb: (uow: Uow) => Promise<void>) => Promise<void>;

	beforeEach(() => {
		// Create mock task repository
		mockUow = {
			taskRepository: {
				save: vi.fn().mockResolvedValue(undefined),
				delete: vi.fn().mockResolvedValue(undefined),
			},
			userRepository: {
				updatePreferences: vi.fn().mockResolvedValue(undefined),
			},
		};

		// Create mock withUow that immediately calls the callback with mockUow
		mockWithUow = vi.fn(async (cb) => cb(mockUow));

		// Create mock current user
		mockCurrentUser = {
			id: "user-123",
			email: "john@example.com",
			name: "John Doe",
			preferences: { locale: "en", theme: "light" },
		};
	});

	it("should delete a task by id", async () => {
		const input: DeleteTaskInput = {
			id: "task-123",
		};

		const configuredDeleteTask = deleteTask({ withUow: mockWithUow });
		await configuredDeleteTask({ input, currentUser: mockCurrentUser });

		expect(mockUow.taskRepository.delete).toHaveBeenCalledWith("task-123");
		expect(mockUow.taskRepository.delete).toHaveBeenCalledTimes(1);
	});

	it("should propagate repository errors", async () => {
		const input: DeleteTaskInput = {
			id: "task-123",
		};

		const error = new Error("Task not found");
		mockUow.taskRepository.delete = vi.fn().mockRejectedValue(error);

		const configuredDeleteTask = deleteTask({ withUow: mockWithUow });
		await expect(
			configuredDeleteTask({ input, currentUser: mockCurrentUser }),
		).rejects.toThrow("Task not found");
	});

	it("should handle deletion of non-existent tasks gracefully", async () => {
		const input: DeleteTaskInput = {
			id: "non-existent-task",
		};

		// The repository should not throw an error for non-existent tasks
		mockUow.taskRepository.delete = vi.fn().mockResolvedValue(undefined);

		const configuredDeleteTask = deleteTask({ withUow: mockWithUow });
		const result = await configuredDeleteTask({
			input,
			currentUser: mockCurrentUser,
		});

		expect(result).toBeUndefined();
		expect(mockUow.taskRepository.delete).toHaveBeenCalledWith("non-existent-task");
	});

	it("should not use the current user in deletion logic", async () => {
		// Note: The current implementation doesn't check ownership
		// This test documents the current behavior
		const input: DeleteTaskInput = {
			id: "task-123",
		};

		const configuredDeleteTask = deleteTask({ withUow: mockWithUow });
		await configuredDeleteTask({ input, currentUser: mockCurrentUser });

		// The delete method only receives the task id, not the user
		expect(mockUow.taskRepository.delete).toHaveBeenCalledWith("task-123");
	});
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { addTask } from "./addTask.js";
import type { Uow } from "../ports/Uow.js";
import type { User } from "../entities/user-and-organization.js";
import type { AddTaskInput } from "../entities/task.js";

describe("addTask use case", () => {
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

	it("should save a task with the current user as owner", async () => {
		const input: AddTaskInput = {
			id: "task-123",
			description: "Buy groceries",
		};

		const configuredAddTask = addTask({ withUow: mockWithUow });
		await configuredAddTask({ input, currentUser: mockCurrentUser });

		expect(mockUow.taskRepository.save).toHaveBeenCalledWith({
			id: "task-123",
			description: "Buy groceries",
			owner: mockCurrentUser,
		});
		expect(mockUow.taskRepository.save).toHaveBeenCalledTimes(1);
	});

	it("should propagate repository errors", async () => {
		const input: AddTaskInput = {
			id: "task-123",
			description: "Buy groceries",
		};

		const error = new Error("Database connection failed");
		mockUow.taskRepository.save = vi.fn().mockRejectedValue(error);

		const configuredAddTask = addTask({ withUow: mockWithUow });
		await expect(
			configuredAddTask({ input, currentUser: mockCurrentUser }),
		).rejects.toThrow("Database connection failed");
	});

	it("should handle tasks with long descriptions", async () => {
		const longDescription = "A".repeat(1000);
		const input: AddTaskInput = {
			id: "task-456",
			description: longDescription,
		};

		const configuredAddTask = addTask({ withUow: mockWithUow });
		await configuredAddTask({ input, currentUser: mockCurrentUser });

		expect(mockUow.taskRepository.save).toHaveBeenCalledWith({
			id: "task-456",
			description: longDescription,
			owner: mockCurrentUser,
		});
	});

	it("should preserve all user data in owner field", async () => {
		const userWithNullName: User = {
			id: "user-456",
			email: "jane@example.com",
			name: null,
			preferences: null,
		};

		const input: AddTaskInput = {
			id: "task-789",
			description: "Test task",
		};

		const configuredAddTask = addTask({ withUow: mockWithUow });
		await configuredAddTask({ input, currentUser: userWithNullName });

		expect(mockUow.taskRepository.save).toHaveBeenCalledWith({
			id: "task-789",
			description: "Test task",
			owner: userWithNullName,
		});
	});
});

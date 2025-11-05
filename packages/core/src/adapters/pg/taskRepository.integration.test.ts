import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createPgTaskRepository } from "./taskRepository.js";
import type { Task } from "../../domain/entities/task.js";
import type { User } from "../../domain/entities/user-and-organization.js";
import {
	getTestDb,
	closeTestDb,
	cleanupTestData,
	createTestUser,
	removeTestUser,
} from "../../test-helpers/db-setup.js";

describe("TaskRepository PostgreSQL integration", () => {
	const testUser: User = {
		id: "test-user-repo-123",
		email: "test-repo@example.com",
		name: "Test User",
		preferences: { locale: "en", theme: "light" },
	};

	let db: Awaited<ReturnType<typeof getTestDb>>;

	beforeAll(async () => {
		db = getTestDb();
		await createTestUser(db, testUser);
	});

	afterAll(async () => {
		await removeTestUser(db, testUser.id);
		await closeTestDb();
	});

	beforeEach(async () => {
		await cleanupTestData(db);
	});

	it("should save a task to the database", async () => {
		const repository = createPgTaskRepository(db);

		const task: Task = {
			id: "task-save-123",
			description: "Test task for save",
			owner: testUser,
		};

		await repository.save(task);

		// Verify task was saved
		const savedTask = await db
			.selectFrom("tasks")
			.selectAll()
			.where("id", "=", task.id)
			.executeTakeFirst();

		expect(savedTask).toBeDefined();
		expect(savedTask?.id).toBe(task.id);
		expect(savedTask?.description).toBe(task.description);
		expect(savedTask?.ownerId).toBe(testUser.id);
	});

	it("should delete a task from the database", async () => {
		const repository = createPgTaskRepository(db);

		// First, insert a task
		const taskId = "task-delete-123";
		await db
			.insertInto("tasks")
			.values({
				id: taskId,
				description: "Task to delete",
				ownerId: testUser.id,
			})
			.execute();

		// Verify task exists
		const taskBefore = await db
			.selectFrom("tasks")
			.selectAll()
			.where("id", "=", taskId)
			.executeTakeFirst();
		expect(taskBefore).toBeDefined();

		// Delete the task
		await repository.delete(taskId);

		// Verify task is deleted
		const taskAfter = await db
			.selectFrom("tasks")
			.selectAll()
			.where("id", "=", taskId)
			.executeTakeFirst();
		expect(taskAfter).toBeUndefined();
	});

	it("should handle deletion of non-existent task without error", async () => {
		const repository = createPgTaskRepository(db);

		// Delete a task that doesn't exist should not throw
		await expect(
			repository.delete("non-existent-task-id"),
		).resolves.toBeUndefined();
	});

	it("should save multiple tasks for the same user", async () => {
		const repository = createPgTaskRepository(db);

		const task1: Task = {
			id: "task-multi-1",
			description: "First task",
			owner: testUser,
		};

		const task2: Task = {
			id: "task-multi-2",
			description: "Second task",
			owner: testUser,
		};

		await repository.save(task1);
		await repository.save(task2);

		// Verify both tasks were saved
		const tasks = await db
			.selectFrom("tasks")
			.selectAll()
			.where("ownerId", "=", testUser.id)
			.execute();

		expect(tasks).toHaveLength(2);
		expect(tasks.map((t) => t.id)).toContain(task1.id);
		expect(tasks.map((t) => t.id)).toContain(task2.id);
	});

	it("should handle tasks with special characters in description", async () => {
		const repository = createPgTaskRepository(db);

		const task: Task = {
			id: "task-special-chars",
			description: 'Task with "quotes", \'apostrophes\', and émojis 🎉',
			owner: testUser,
		};

		await repository.save(task);

		const savedTask = await db
			.selectFrom("tasks")
			.selectAll()
			.where("id", "=", task.id)
			.executeTakeFirst();

		expect(savedTask?.description).toBe(task.description);
	});
});

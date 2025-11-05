import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createPgTaskQueries } from "./taskQueries.js";
import type { User } from "../../domain/entities/user-and-organization.js";
import {
	getTestDb,
	closeTestDb,
	cleanupTestData,
	createTestUser,
	removeTestUser,
} from "../../test-helpers/db-setup.js";

describe("TaskQueries PostgreSQL integration", () => {
	const testUser: User = {
		id: "test-user-queries-123",
		email: "test-queries@example.com",
		name: "Test Queries User",
		preferences: { locale: "fr", theme: "dark" },
	};

	const anotherUser: User = {
		id: "another-user-123",
		email: "another@example.com",
		name: "Another User",
		preferences: null,
	};

	let db: Awaited<ReturnType<typeof getTestDb>>;

	beforeAll(async () => {
		db = getTestDb();
		await createTestUser(db, testUser);
		await createTestUser(db, anotherUser);
	});

	afterAll(async () => {
		await removeTestUser(db, testUser.id);
		await removeTestUser(db, anotherUser.id);
		await closeTestDb();
	});

	beforeEach(async () => {
		await cleanupTestData(db);
	});

	it("should return all tasks for a specific user", async () => {
		const queries = createPgTaskQueries(db);

		// Insert tasks for test user
		await db
			.insertInto("tasks")
			.values([
				{
					id: "task-1",
					description: "Task 1 for test user",
					ownerId: testUser.id,
				},
				{
					id: "task-2",
					description: "Task 2 for test user",
					ownerId: testUser.id,
				},
			])
			.execute();

		// Insert task for another user
		await db
			.insertInto("tasks")
			.values({
				id: "task-3",
				description: "Task for another user",
				ownerId: anotherUser.id,
			})
			.execute();

		const tasks = await queries.getAllTasksForUser(testUser.id);

		expect(tasks).toHaveLength(2);
		expect(tasks.map((t) => t.id)).toContain("task-1");
		expect(tasks.map((t) => t.id)).toContain("task-2");
		expect(tasks.map((t) => t.id)).not.toContain("task-3");
	});

	it("should return empty array when user has no tasks", async () => {
		const queries = createPgTaskQueries(db);

		const tasks = await queries.getAllTasksForUser(testUser.id);

		expect(tasks).toEqual([]);
	});

	it("should return tasks with complete owner information", async () => {
		const queries = createPgTaskQueries(db);

		await db
			.insertInto("tasks")
			.values({
				id: "task-with-owner",
				description: "Task with full owner info",
				ownerId: testUser.id,
			})
			.execute();

		const tasks = await queries.getAllTasksForUser(testUser.id);

		expect(tasks).toHaveLength(1);
		const task = tasks[0];

		expect(task.id).toBe("task-with-owner");
		expect(task.description).toBe("Task with full owner info");
		expect(task.owner).toBeDefined();
		expect(task.owner.id).toBe(testUser.id);
		expect(task.owner.email).toBe(testUser.email);
		expect(task.owner.name).toBe(testUser.name);
		expect(task.owner.preferences).toEqual(testUser.preferences);
	});

	it("should handle user with null name and null preferences", async () => {
		const queries = createPgTaskQueries(db);

		await db
			.insertInto("tasks")
			.values({
				id: "task-null-user-fields",
				description: "Task for user with nulls",
				ownerId: anotherUser.id,
			})
			.execute();

		const tasks = await queries.getAllTasksForUser(anotherUser.id);

		expect(tasks).toHaveLength(1);
		expect(tasks[0].owner.id).toBe(anotherUser.id);
		expect(tasks[0].owner.name).toBe(anotherUser.name);
		expect(tasks[0].owner.preferences).toBeNull();
	});

	it("should return tasks in consistent order", async () => {
		const queries = createPgTaskQueries(db);

		// Insert multiple tasks
		const taskIds = ["task-a", "task-b", "task-c", "task-d", "task-e"];
		await db
			.insertInto("tasks")
			.values(
				taskIds.map((id) => ({
					id,
					description: `Description for ${id}`,
					ownerId: testUser.id,
				})),
			)
			.execute();

		const tasks1 = await queries.getAllTasksForUser(testUser.id);
		const tasks2 = await queries.getAllTasksForUser(testUser.id);

		expect(tasks1).toHaveLength(5);
		expect(tasks2).toHaveLength(5);

		// Results should be consistent across multiple calls
		expect(tasks1.map((t) => t.id)).toEqual(tasks2.map((t) => t.id));
	});

	it("should handle special characters in task descriptions", async () => {
		const queries = createPgTaskQueries(db);

		const specialDescription =
			'Task with "quotes", \'apostrophes\', newlines\n and émojis 🚀';
		await db
			.insertInto("tasks")
			.values({
				id: "task-special",
				description: specialDescription,
				ownerId: testUser.id,
			})
			.execute();

		const tasks = await queries.getAllTasksForUser(testUser.id);

		expect(tasks).toHaveLength(1);
		expect(tasks[0].description).toBe(specialDescription);
	});

	it("should not return tasks from other users", async () => {
		const queries = createPgTaskQueries(db);

		// Insert tasks for multiple users
		await db
			.insertInto("tasks")
			.values([
				{ id: "task-user1", description: "Task 1", ownerId: testUser.id },
				{
					id: "task-user2-1",
					description: "Task 2",
					ownerId: anotherUser.id,
				},
				{
					id: "task-user2-2",
					description: "Task 3",
					ownerId: anotherUser.id,
				},
			])
			.execute();

		const user1Tasks = await queries.getAllTasksForUser(testUser.id);
		const user2Tasks = await queries.getAllTasksForUser(anotherUser.id);

		expect(user1Tasks).toHaveLength(1);
		expect(user1Tasks[0].id).toBe("task-user1");

		expect(user2Tasks).toHaveLength(2);
		expect(user2Tasks.map((t) => t.id)).toContain("task-user2-1");
		expect(user2Tasks.map((t) => t.id)).toContain("task-user2-2");
	});
});

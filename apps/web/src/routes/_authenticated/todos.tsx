import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addTask, deleteTask, listTasks } from "@/server/functions/tasks";

export const Route = createFileRoute("/_authenticated/todos")({
  component: RouteComponent,
  loader: async () => {
    const tasks = await listTasks();
    return { tasks };
  },
});

function RouteComponent() {
  const { tasks: initialTasks } = Route.useLoaderData();
  const [tasks, setTasks] = useState(initialTasks);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const id = crypto.randomUUID();
      await addTask({ data: { id, description: description.trim() } });
      const updatedTasks = await listTasks();
      setTasks(updatedTasks);
      setDescription("");
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ data: { id: taskId } });
      const updatedTasks = await listTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Todos</h1>

      <form onSubmit={handleAddTask} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Task"}
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task: { id: string; description: string }) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200"
              >
                <span>{task.description}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

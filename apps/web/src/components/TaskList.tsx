import type { Task } from "@tasks/core";

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  if (tasks.length === 0) {
    return <div className="p-4">No tasks yet</div>;
  }

  return (
    <>
      <h1 className="text-2xl mb-4">My Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>- {task.description}</li>
        ))}
      </ul>
    </>
  );
};

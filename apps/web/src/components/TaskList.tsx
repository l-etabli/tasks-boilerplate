import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@tasks/core";
import { useTRPC } from "../integrations/trpc/react";

type TaskItemProps = {
  task: Task;
  onDelete: () => void;
  isDeleting: boolean;
};

const TaskItem = ({ task, onDelete, isDeleting }: TaskItemProps) => (
  <li className="flex items-center justify-between p-2 border rounded">
    <span>- {task.description}</span>
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  </li>
);

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const deleteTaskMutation = useMutation({
    ...trpc.tasks.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.tasks.list.queryKey(),
      });
    },
  });

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate({ id: taskId });
    }
  };

  if (tasks.length === 0) {
    return <div className="p-4">No tasks yet</div>;
  }

  return (
    <>
      <h1 className="text-2xl mb-4">My Tasks</h1>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={() => handleDelete(task.id)}
            isDeleting={deleteTaskMutation.isPending}
          />
        ))}
      </ul>
    </>
  );
};

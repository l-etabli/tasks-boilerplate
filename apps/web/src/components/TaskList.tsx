import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@tasks/core";
import { useState } from "react";
import { deleteTask } from "@/server/functions/tasks";
import { useI18nContext } from "../i18n/i18n-react";

type TaskItemProps = {
  task: Task;
  onDelete: () => void;
  isDeleting: boolean;
};

const TaskItem = ({ task, onDelete, isDeleting }: TaskItemProps) => {
  const { LL } = useI18nContext();

  return (
    <li
      className={`group bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 ease-out transform-gpu overflow-hidden ${
        isDeleting ? "scale-95 opacity-0 max-h-0 py-0 my-0" : "scale-100 opacity-100 max-h-96"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-900 font-medium">{task.description}</span>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="px-2.5 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isDeleting ? LL.loading() : LL.delete()}
        </button>
      </div>
    </li>
  );
};

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { LL } = useI18nContext();

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      setDeletingTaskId(null);
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const handleDelete = (taskId: string) => {
    // Start animation
    setDeletingTaskId(taskId);

    // Execute deletion after animation completes
    setTimeout(() => {
      deleteTaskMutation.mutate({ data: { id: taskId } });
    }, 300);
  };

  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">{LL.tasks.title()}</h1>
          <p className="text-gray-600 mt-1">{LL.tasks.taskCount({ count: 0 })}</p>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{LL.tasks.noTasks()}</h3>
          <p className="text-gray-500">{LL.tasks.noTasks()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">{LL.tasks.title()}</h1>
        <p className="text-gray-600 mt-1">{LL.tasks.taskCount({ count: tasks.length })}</p>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={() => handleDelete(task.id)}
            isDeleting={deletingTaskId === task.id || deleteTaskMutation.isPending}
          />
        ))}
      </ul>
    </div>
  );
};

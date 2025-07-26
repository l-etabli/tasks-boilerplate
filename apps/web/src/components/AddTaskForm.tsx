import { useAppForm } from "@/hooks/demo.form.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/integrations/trpc/react";

export const AddTaskForm = () => {
  const queryClient = useQueryClient();

  const trpc = useTRPC();

  const addTaskMutation = useMutation({
    ...trpc.tasks.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.tasks.list.queryKey(),
      });
    },
  });

  const form = useAppForm({
    defaultValues: { description: "" },
    // validators: {
    //   onSubmit: addTaskSchema
    // },
    onSubmit: async ({ value, formApi }) => {
      await addTaskMutation.mutate({
        id: new Date().toISOString(),
        description: value.description,
      });
      formApi.reset();
    },
  });

  return (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add a task</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.AppField name="description">
            {(field) => <field.TextField label="Task description" />}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton label="Add" />
          </form.AppForm>
        </form>

        {addTaskMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{addTaskMutation.error.message}</p>
          </div>
        )}

        {addTaskMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">Task added successfully</p>
          </div>
        )}

        {addTaskMutation.isPending && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">Adding task...</p>
          </div>
        )}
      </div>
    </div>
  );
};

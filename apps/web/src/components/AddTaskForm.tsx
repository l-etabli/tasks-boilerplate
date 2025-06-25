import { useAppForm } from "@/hooks/demo.form.ts";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { useTRPC } from "@/integrations/trpc/react";

export const AddTaskForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const addTaskMutation = useMutation(trpc.tasks.add.mutationOptions());

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
      await router.invalidate();
    },
  });

  return (
    <>
      <h2 className="text-2xl mb-4">Add a task</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}
      >
        <form.AppField name="description">
          {(field) => <field.TextField label="Task description" />}
        </form.AppField>
        <form.AppForm>
          <form.SubscribeButton label="Add" />
        </form.AppForm>
      </form>

      {addTaskMutation.isError && (
        <div className="bg-red-500 text-white p-4">{addTaskMutation.error.message}</div>
      )}

      {addTaskMutation.isSuccess && (
        <div className="bg-green-500 text-white p-4">Task added successfully</div>
      )}

      {addTaskMutation.isPending && (
        <div className="bg-yellow-500 text-white p-4">Adding task...</div>
      )}
    </>
  );
};

import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { useState } from "react";
import { z } from "zod";
import { useI18nContext } from "@/i18n/i18n-react";
import { addTask, deleteTask, listTasks } from "@/server/functions/tasks";

const taskSchema = z.object({
  description: z.string().min(1).max(500),
});

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
  const { LL } = useI18nContext();

  const form = useForm({
    defaultValues: {
      description: "",
    },
    validators: {
      onChange: taskSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const id = crypto.randomUUID();
        await addTask({ data: { id, description: value.description.trim() } });
        const updatedTasks = await listTasks();
        setTasks(updatedTasks);
        form.reset();
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    },
  });

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
      <h1 className="text-3xl font-bold mb-6">{LL.todos.title()}</h1>

      <form
        id="form-add-task"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mb-8"
      >
        <form.Field name="description">
          {(field) => (
            <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
              <FieldLabel htmlFor="task-description" className="sr-only">
                {LL.todos.inputPlaceholder()}
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="task-description"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={LL.todos.inputPlaceholder()}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  className="flex-1"
                />
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      id="btn-submit-add-task"
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? LL.todos.adding() : LL.todos.add()}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.Field>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {LL.todos.listHeading({ count: tasks.length })}
        </h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{LL.todos.empty()}</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task: { id: string; description: string }) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-800"
              >
                <span className="dark:text-gray-100">{task.description}</span>
                <Button
                  id="btn-delete-task"
                  data-task-id={task.id}
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  variant="destructive"
                  size="sm"
                >
                  {LL.todos.delete()}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

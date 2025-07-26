import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskList } from "@/components/TaskList";
import { useTRPC } from "@/integrations/trpc/react";

export const Route = createFileRoute("/_authenticated/demo/tanstack-query")({
  // Removed SSR data prefetching to eliminate 1+ second delay
  // The query will be handled client-side after authentication
  component: TanStackQueryDemo,
});

function TanStackQueryDemo() {
  const trpc = useTRPC();
  const { data, error } = useQuery(trpc.tasks.list.queryOptions());

  if (error) return <div className="p-4 bg-red-500 text-white">Error: {error.message}</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <TaskList tasks={data} />
      <AddTaskForm />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@tasks/ui/components/badge";
import { Button } from "@tasks/ui/components/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
        <Badge>My badge</Badge>
      </div>
    </div>
  );
}

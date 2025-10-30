import { Button } from "@tasks/ui/components/button";
import { Badge } from "@tasks/ui/components/badge";

/**
 * Example component demonstrating the use of shadcn/ui components from @tasks/ui package
 * This shows that the monorepo setup is working correctly.
 */
export function ShadcnExample() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="text-2xl font-bold">shadcn/ui Example</h2>
      <p className="text-muted-foreground">
        Components imported from @tasks/ui package
      </p>

      <div className="flex gap-2 flex-wrap">
        <Button variant="default">Default Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge>Default Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </div>
  );
}

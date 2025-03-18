import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@tasks/ui/components/badge";
import { Button } from "@tasks/ui/components/button";
import { hc } from "hono/client";
import { useEffect, useState } from "react";
import type { AppType } from "../../../back/src/index";

const client = hc<AppType>("/api");

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const useHelloWord = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client["hello-world"]
      .$get()
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { message, isLoading, error };
};

async function RouteComponent() {
  const { message, isLoading, error } = useHelloWord();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
        <Badge>My badge</Badge>
        <p>
          <strong>Comming from backend : </strong>
          {message}
        </p>
      </div>
    </div>
  );
}

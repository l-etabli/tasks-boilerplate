import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

export type AppType = typeof router;

const router = app.get("/hello-world", (c) => {
  return c.json({ message: "Hello World !" });
});

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

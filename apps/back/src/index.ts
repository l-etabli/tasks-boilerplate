import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

export type AppType = typeof router;
app.use("*", cors());
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

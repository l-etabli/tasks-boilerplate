import { Hono } from "hono";

export const app = new Hono();

export type AppType = typeof router;

const router = app.get("/hello-world", (c) => {
  return c.json({ message: "Hello World !" });
});

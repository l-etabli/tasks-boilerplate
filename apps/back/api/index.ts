import { handle } from "hono/vercel";
import { app } from "../src/server.js";

export const handler = handle(app);

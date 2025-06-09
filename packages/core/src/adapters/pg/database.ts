import type { AuthTables } from "./auth-tables.js";

export type Db = AuthTables & {
  tasks: TasksTable;
};

type TasksTable = {
  id: string;
  description: string;
  ownerId: string;
};

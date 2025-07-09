import type { AuthDatabase } from "./auth-tables.js";

export type Db = AuthDatabase & {
  tasks: TasksTable;
};

interface TasksTable {
  id: string;
  description: string;
  ownerId: string;
}

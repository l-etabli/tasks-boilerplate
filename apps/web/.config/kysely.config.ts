import { defineConfig } from "kysely-ctl";
import { db } from "../src/utils/init-db.js";

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: ".config/migrations",
  },
});

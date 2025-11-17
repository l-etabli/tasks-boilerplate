import type { Kysely } from "kysely";
import type { HealthQueries } from "../../domain/shared/ports/HealthQueries.js";
import type { Db } from "./database.js";

export const createPgHealthQueries = (db: Kysely<Db>): HealthQueries => ({
  checkHealth: async () => {
    await db.selectFrom("user").select("id").limit(1).execute();
  },
});

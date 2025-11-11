import type { Kysely } from "kysely";
import type { WithUow } from "../../domain/ports/Uow.js";
import type { Db } from "./database.js";
import { createPgTaskRepository } from "./taskRepository.js";
import { createPgUserRepository } from "./userRepository.js";

export const createWithPgUnitOfWork = (db: Kysely<Db>): WithUow => {
  return (cb) => {
    return db.transaction().execute((trx) => {
      const uow = {
        taskRepository: createPgTaskRepository(trx),
        userRepository: createPgUserRepository(trx),
      };
      return cb(uow);
    });
  };
};

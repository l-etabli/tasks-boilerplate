import { defineConfig } from 'kysely-ctl'
import { getKyselyDb } from './src/connection.js'

export default defineConfig({
  kysely: getKyselyDb(),
  migrations: {
    migrationFolder: './src/migrations'
  }
})
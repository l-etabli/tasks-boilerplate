import { defineConfig } from 'kysely-ctl'
import { db } from './src/connection.js'

export default defineConfig({
  kysely: db(),
  migrations: {
    migrationFolder: './migrations'
  }
})
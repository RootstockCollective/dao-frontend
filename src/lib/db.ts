import knex, { Knex } from 'knex'
import { sslConfig } from './dbUtils'

const globalForDb = globalThis as typeof globalThis & { _db?: Knex }

if (!globalForDb._db) {
  globalForDb._db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: sslConfig,
    },
    pool: { min: 0, max: 5 },
  })
}

const db = globalForDb._db

export { db }

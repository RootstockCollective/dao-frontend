/**
 * Database client for user-generated data (dao_data)
 *
 * IMPORTANT: This is a SEPARATE database from state-sync to avoid data loss
 * during reorg operations. Uses DAO_DATA_DB_CONNECTION_STRING env variable.
 */

import knex, { Knex } from 'knex'
import { sslConfig } from './dbUtils'

const connectionString = process.env.DAO_DATA_DB_CONNECTION_STRING

const globalForDb = globalThis as typeof globalThis & { _daoDataDb?: Knex }

if (connectionString && !globalForDb._daoDataDb) {
  globalForDb._daoDataDb = knex({
    client: 'pg',
    connection: {
      connectionString,
      ssl: sslConfig,
    },
    pool: { min: 0, max: 5 },
  })
}

const daoDataDb = globalForDb._daoDataDb

export { daoDataDb }

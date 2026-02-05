/**
 * Database client for user-generated data (dao_data)
 *
 * IMPORTANT: This is a SEPARATE database from state-sync to avoid data loss
 * during reorg operations. Uses DAO_DATA_DB_CONNECTION_STRING env variable.
 */

import knex from 'knex'
import fs from 'fs'
import pg from 'pg'

pg.types.setTypeParser(17, val => Buffer.from(val.slice(2), 'hex').toString())

// Check if SSL certificate exists and configure SSL accordingly
const certPath = '/app/rds-ca-cert.pem'
const sslConfig = fs.existsSync(certPath)
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString(),
    }
  : false

const connectionString = process.env.DAO_DATA_DB_CONNECTION_STRING

/**
 * Database client for dao_data
 * Will be undefined if DAO_DATA_DB_CONNECTION_STRING is not set
 */
const daoDataDb = connectionString
  ? knex({
      client: 'pg',
      connection: {
        connectionString,
        ssl: sslConfig,
      },
    })
  : undefined

export { daoDataDb }

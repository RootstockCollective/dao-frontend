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

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: sslConfig,
  },
})

export { db }

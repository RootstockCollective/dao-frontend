import fs from 'fs'
import pg from 'pg'

// Parse bytea columns as hex strings (only needs to run once)
pg.types.setTypeParser(17, val => Buffer.from(val.slice(2), 'hex').toString())

const certPath = '/app/rds-ca-cert.pem'

export const sslConfig = fs.existsSync(certPath)
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString(),
    }
  : false
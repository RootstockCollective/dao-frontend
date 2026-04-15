import knex, { Knex } from 'knex'

import { sslConfig } from './dbUtils'

const globalForDb = globalThis as typeof globalThis & { _db?: Knex }

const withAppName = (url: string | undefined, name: string): string | undefined => {
  if (!url) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}application_name=${encodeURIComponent(name)}`
}

if (!globalForDb._db) {
  const profile = process.env.NEXT_PUBLIC_PROFILE ?? 'local'
  globalForDb._db = knex({
    client: 'pg',
    connection: {
      // Tag connections with application_name via the URL — the top-level option
      // is ignored by pg when `connectionString` is set.
      connectionString: withAppName(process.env.DB_CONNECTION_STRING, `dao-frontend-knex-${profile}`),
      ssl: sslConfig,
    },
    pool: { min: 0, max: 5 },
  })
}

const db = globalForDb._db

export { db }

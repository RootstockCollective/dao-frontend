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
      // Server-side cap, in ms, so a runaway query cannot hold one of the five connections
      // indefinitely. Generous on purpose: it bounds the worst case, not the normal one.
      statement_timeout: 30_000,
    },
    pool: { min: 0, max: 5 },
    // How long a request waits for a free connection, in ms (knex's default is 60 s). When the pool is
    // saturated, routes should fail fast with their 503 rather than hang for a minute.
    acquireConnectionTimeout: 10_000,
  })
}

const db = globalForDb._db

export { db }

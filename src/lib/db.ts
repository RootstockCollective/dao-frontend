import knex from 'knex'

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DB_CONNECTION_STRING,
  },
})

export { db }

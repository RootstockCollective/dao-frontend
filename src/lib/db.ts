import knex from 'knex'

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.ROOTSTOCK_COLLECTIVE_STATE,
  },
})

export { db }

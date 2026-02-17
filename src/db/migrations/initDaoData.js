/**
 * Idempotent migration script for ProposalLikes table
 * Creates dao_data schema and ProposalLikes table with indexes
 *
 * This script is safe for multiple executions - all DDL operations use IF NOT EXISTS
 *
 * IMPORTANT: This uses a SEPARATE database from state-sync to avoid data loss
 * during reorg operations. Requires DAO_DATA_DB_CONNECTION_STRING env variable.
 */

const knex = require('knex')
const fs = require('fs')
const pg = require('pg')
const path = require('path')

// Load environment variables from .env.testnet.local for local development
// In production, env vars are set by ECS task definition
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.testnet.local') })

// Configure pg type parser for bytea
pg.types.setTypeParser(17, val => Buffer.from(val.slice(2), 'hex').toString())

// Check if SSL certificate exists and configure SSL accordingly
const certPath = '/app/rds-ca-cert.pem'
const sslConfig = fs.existsSync(certPath)
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath).toString(),
    }
  : false

// Use separate database for user-generated data (likes, reactions)
// This is intentionally different from DB_CONNECTION_STRING used by state-sync
const connectionString = process.env.DAO_DATA_DB_CONNECTION_STRING

const SCHEMA_NAME = 'dao_data'
const TABLE_NAME = 'ProposalLikes'
const FULL_TABLE_NAME = `${SCHEMA_NAME}."${TABLE_NAME}"`

async function runMigration() {
  if (!connectionString) {
    console.warn('[Migration] DAO_DATA_DB_CONNECTION_STRING not set, skipping ProposalLikes migration')
    return
  }

  const db = knex({
    client: 'pg',
    connection: {
      connectionString,
      ssl: sslConfig,
    },
  })

  console.log('[Migration] Starting ProposalLikes migration...')

  try {
    // Check if schema exists before attempting to create it.
    // In AWS, the DB user may not have permissions to create schemas,
    // so we only attempt creation when the schema is actually missing (e.g. local dev).
    const schemaExists = await db.raw(
      `SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = ?)`,
      [SCHEMA_NAME],
    )

    if (!schemaExists.rows[0].exists) {
      await db.raw(`CREATE SCHEMA ${SCHEMA_NAME}`)
      console.log(`[Migration] Schema "${SCHEMA_NAME}" created`)
    } else {
      console.log(`[Migration] Schema "${SCHEMA_NAME}" already exists`)
    }

    // Create table if not exists
    await db.raw(`
      CREATE TABLE IF NOT EXISTS ${FULL_TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        "proposalId" BYTEA NOT NULL,
        "userAddress" VARCHAR(42) NOT NULL,
        "likedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reaction VARCHAR(50) NOT NULL,
        CONSTRAINT unique_user_proposal UNIQUE ("proposalId", "userAddress", reaction)
      )
    `)
    console.log(`[Migration] Table "${FULL_TABLE_NAME}" ensured`)

    // Create indexes if not exist
    await db.raw(`
      CREATE INDEX IF NOT EXISTS idx_proposal_likes_proposal_id 
      ON ${FULL_TABLE_NAME} ("proposalId")
    `)
    console.log('[Migration] Index on proposalId ensured')

    await db.raw(`
      CREATE INDEX IF NOT EXISTS idx_proposal_likes_user_address 
      ON ${FULL_TABLE_NAME} ("userAddress")
    `)
    console.log('[Migration] Index on userAddress ensured')

    console.log('[Migration] ProposalLikes migration completed successfully')
  } catch (error) {
    // Log error but do not throw to prevent deployment failure (as per AC)
    console.error('[Migration] Error during ProposalLikes migration:', error)
    console.error('[Migration] Migration failed but deployment will continue')
  } finally {
    // Close the database connection
    await db.destroy()
  }
}

// Run migration when script is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('[Migration] Script finished')
      process.exit(0)
    })
    .catch(error => {
      console.error('[Migration] Unexpected error:', error)
      process.exit(1)
    })
}

module.exports = { runMigration, SCHEMA_NAME, TABLE_NAME, FULL_TABLE_NAME }

/**
 * Database migration runner
 * Executes all migration scripts from the migrations/ folder
 */

const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, 'migrations')

async function runAllMigrations() {
  console.log('[Migrate] Starting database migrations...')

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js'))
    .sort()

  if (files.length === 0) {
    console.log('[Migrate] No migration files found')
    return
  }

  console.log(`[Migrate] Found ${files.length} migration(s): ${files.join(', ')}`)

  for (const file of files) {
    console.log(`[Migrate] Running ${file}...`)
    try {
      const migration = require(path.join(migrationsDir, file))
      if (typeof migration.runMigration === 'function') {
        await migration.runMigration()
      }
    } catch (error) {
      console.error(`[Migrate] Error in ${file}:`, error)
      // Continue with other migrations
    }
  }

  console.log('[Migrate] All migrations completed')
}

runAllMigrations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('[Migrate] Fatal error:', error)
    process.exit(1)
  })
